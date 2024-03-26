const generateColor = () => {
  const hexChars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];
  let hexColor = "#";
  const generate = () => {
    for (let i = 0; i < 6; i++) {
      hexColor += hexChars[Math.floor(Math.random() * 16)];
    }
    if (hexColor === "#000000" || hexColor === "#ffffff") {
      hexColor = "#";
      generate();
    }
    return;
  };
  generate();

  return hexColor;
};

// -----------------------------------------------------------

const generateRadius = (minR: number, maxR: number) => {
  return Math.round(minR + Math.random() * (maxR - minR));
};

// -----------------------------------------------------------

const generateCoordinates = (
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
) => {
  const x = Math.round(xMin + Math.random() * (xMax - xMin));
  const y = Math.round(yMin + Math.random() * (yMax - yMin));
  return { x, y };
};

// -----------------------------------------------------------

const getDistance = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
) => {
  const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) - r1 - r2;
  const isOverlapping = distance < 0;
  return { distance, isOverlapping };
};

// -----------------------------------------------------------

type CollapseData = {
  x1: number;
  y1: number;
  r1: number;
  vx1: number;
  vy1: number;
  x2: number;
  y2: number;
  r2: number;
  vx2: number;
  vy2: number;
  attenuationRatio: number;
};

const getSpeeds = (data: CollapseData) => {
  const { x1, y1, r1, vx1, vy1, x2, y2, r2, vx2, vy2, attenuationRatio } = data;

  let vx1New = vx1;
  let vy1New = vy1;
  let vx2New = vx2;
  let vy2New = vy2;

  const alpha = y2 !== y1 ? Math.atan2(x2 - x1, y2 - y1) : x2 > x1 ? 1 : -1;
  const vx1alpha = vx1 * Math.cos(alpha) - vy1 * Math.sin(alpha);
  const vy1alpha = vx1 * Math.sin(alpha) + vy1 * Math.cos(alpha);
  const vx2alpha = vx2 * Math.cos(alpha) - vy2 * Math.sin(alpha);
  const vy2alpha = -vx2 * Math.sin(alpha) - vy2 * Math.cos(alpha);

  const uy1alpha =
    (vy1alpha * r1 ** 3 + 2 * vy2alpha * r2 ** 3 - vy1alpha * r2 ** 3) /
    (r1 ** 3 + r2 ** 3);

  const uy2alpha = uy1alpha - vy2alpha + vy1alpha;

  vx1New =
    (vx1alpha * Math.cos(alpha) - uy1alpha * Math.sin(alpha)) *
    attenuationRatio;
  vy1New =
    (-vx1alpha * Math.sin(alpha) + uy1alpha * Math.cos(alpha)) *
    attenuationRatio;
  vx2New =
    (-vx2alpha * Math.cos(alpha) + uy2alpha * Math.sin(alpha)) *
    attenuationRatio;
  vy2New =
    (-vx2alpha * Math.sin(alpha) + uy2alpha * Math.cos(alpha)) *
    attenuationRatio;

  return { vx1New, vy1New, vx2New, vy2New };
};

// -----------------------------------------------------------

export { generateColor, generateRadius, generateCoordinates, getDistance, getSpeeds };
