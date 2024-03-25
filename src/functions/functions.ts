export const drawBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  // const grad = ctx.createRadialGradient(x + r / 4, y - r / 8, 0, x, y, r);
  // grad.addColorStop(0, "#fff");
  // grad.addColorStop(0.8, color);
  // grad.addColorStop(1, color);
  ctx.fillStyle = color;
  // ctx.fillStyle = grad;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
};

// ---------------------------------------------------------

type AnimateParams = {
  timestamp?: DOMHighResTimeStamp;
  pTimestamp?: DOMHighResTimeStamp;
  diff?: number;
  fps?: number;
  secondPart?: number;
};

type AnimateMethods = {
  clear: () => void;
  update: (params: AnimateParams) => void;
  render: (params: AnimateParams) => void;
};

export const animate = (obj: AnimateMethods) => {
  const { clear, update, render } = obj;
  let pTimestamp: DOMHighResTimeStamp = 0;

  const tick = (timestamp: DOMHighResTimeStamp) => {
    requestAnimationFrame(tick);

    const diff = timestamp - pTimestamp;
    pTimestamp = timestamp;
    const fps = 1000 / diff;
    const secondPart = diff / 1000;

    const params = {
      timestamp,
      pTimestamp,
      diff,
      fps,
      secondPart,
    };

    update(params);
    clear();
    render(params);
  };

  requestAnimationFrame(tick);
};

// ---------------------------------------------------------

export const trackMouse = (canvas: HTMLCanvasElement) => {
  const { left, top } = canvas.getBoundingClientRect();

  const mouse = {
    x: 0,
    y: 0,
    dX: 0,
    dY: 0,
    timestamp: 0,
    on: false,
    ball: false,
  };

  const mousemoveHandler = (e: MouseEvent) => {
    mouse.x = e.clientX - left;
    mouse.y = e.clientY - top;
    mouse.dX = e.movementX;
    mouse.dY = e.movementY;
    mouse.timestamp = e.timeStamp;
  };

  const mouseenterHandler = () => {
    mouse.on = true;
  };

  const mouseleaveHandler = () => {
    mouse.on = false;
  };

  const mousedownHandler = (e: MouseEvent) => {
    if (e.button === 0 && mouse.on) {
      mouse.ball = true;
    }
    if (e.button === 2) {
      console.log("right button clicked");
    }
  };

  const mouseupHandler = (e: MouseEvent) => {
    if (e.button === 0) {
      mouse.ball = false;
    }
  };

  canvas.addEventListener("mousedown", mousedownHandler);
  canvas.addEventListener("mouseup", mouseupHandler);
  canvas.addEventListener("mouseenter", mouseenterHandler);
  canvas.addEventListener("mouseleave", mouseleaveHandler);
  canvas.addEventListener("mousemove", mousemoveHandler);

  return mouse;
};

// ---------------------------------------------------------

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

export const handleCollapse = (data: CollapseData) => {
  const { x1, y1, r1, vx1, vy1, x2, y2, r2, vx2, vy2, attenuationRatio } = data;

  let vx1New = 0;
  let vy1New = 0;
  let x1new = x1;
  let y1new = y1;

  const distToMouse = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) - r1 - r2;

  // if (distToMouse < 0) {
  //   console.log('fallback')
  //   vx1New = vx2 * 2 || -vx1;
  //   vy1New = vy2 * 2 || -vy1;
  //   return { vx1New, vy1New };
  // }

  if (distToMouse < 0) {
    x1new = x1 > x2 ? x1 + distToMouse * 1.5 : x1 - distToMouse * 1.5;
    y1new = y1 > y2 ? y1 + distToMouse * 1.5 : y1 - distToMouse * 1.5;
  }

  const vFactor = 2;
  let p = (y2 - y1) / (r1 + r2);
  p = p > 1 ? 1 : p < -1 ? -1 : p;
  const alpha = Math.acos(p);
  console.log(`(y2 - y1) / (r1 + r2) = ${(y2 - y1) / (r1 + r2)}`);
  console.log(`alpha = ${alpha}`);
  console.log(data);
  const vx1alpha = vx1 * Math.cos(alpha) - vy1 * Math.sin(alpha);
  const vy1alpha = vx1 * Math.sin(alpha) + vy1 * Math.cos(alpha);

  // const vx2alpha = vx2 * Math.cos(alpha) - vy2 * Math.sin(alpha);
  const vy2alpha = (-vx2 * Math.sin(alpha) - vy2 * Math.cos(alpha)) * vFactor;

  const uy1alpha =
    (vy1alpha * r1 ** 3 + 2 * vy2alpha * r2 ** 3 - vy1alpha * r2 ** 3) /
    (r1 ** 3 + r2 ** 3);

  vx1New =
    (vx1alpha * Math.cos(alpha) - uy1alpha * Math.sin(alpha)) *
    attenuationRatio;
  vy1New =
    (-vx1alpha * Math.sin(alpha) + uy1alpha * Math.cos(alpha)) *
    attenuationRatio;

  return { vx1New, vy1New, x1new, y1new };
};

// ---------------------------------------------------------
export const handleStroke = (data: CollapseData) => {
  const { x1, y1, vx1, vy1, x2, y2, vx2, vy2, attenuationRatio } = data;

  let vx1New = 0;
  let vy1New = 0;

  const alpha = y2 !== y1 ? Math.atan2(x2 - x1, y2 - y1) : x2 > x1 ? 1 : -1;

  const vx1alpha = vx1 * Math.cos(alpha) - vy1 * Math.sin(alpha);
  const vy1alpha = vx1 * Math.sin(alpha) + vy1 * Math.cos(alpha);
  const vy2alpha = -vx2 * Math.sin(alpha) - vy2 * Math.cos(alpha);

  const uy1alpha = -vy2alpha - vy1alpha;

  vx1New =
    (vx1alpha * Math.cos(alpha) + uy1alpha * Math.sin(alpha)) *
    attenuationRatio;
  vy1New =
    (-vx1alpha * Math.sin(alpha) + uy1alpha * Math.cos(alpha)) *
    attenuationRatio;

  return { vx1New, vy1New };
};
// ---------------------------------------------------------

// ---------------------------------------------------------
