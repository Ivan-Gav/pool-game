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

class Mouse {
  x: number;
  y: number;
  // r: number;
  dX: number;
  dY: number;
  timestamp: number;
  // overTable: boolean;
  isBall: boolean;
  ball: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    // this.r = r;
    this.dX = 0;
    this.dY = 0;
    this.timestamp = 0;
    // this.overTable = false;
    this.isBall = false;
    this.ball = -1;
  }

  // setDX(dX: number) {
  //   this.dX = dX;
  //   const delay = setTimeout(() => {
  //     this.dX = 0;
  //     return () => clearTimeout(delay);
  //   }, 10);
  // }

  // setDY(dY: number) {
  //   this.dY = dY;
  //   const delay = setTimeout(() => {
  //     this.dY = 0;
  //     return () => clearTimeout(delay);
  //   }, 10);
  // }
}

export const trackMouse = (canvas: HTMLCanvasElement) => {
  const { left, top } = canvas.getBoundingClientRect();

  const mouse = new Mouse();

  const mousemoveHandler = (e: MouseEvent) => {
    mouse.x = e.clientX - left;
    mouse.y = e.clientY - top;
    // mouse.setDX(e.movementX);
    // mouse.setDY(e.movementY);
    mouse.dX = e.movementX;
    mouse.dY = e.movementY;
    mouse.timestamp = e.timeStamp;
  };

  // const mouseenterHandler = () => {
  //   mouse.overTable = true;
  // };

  const mouseleaveHandler = () => {
    mouse.isBall = false;
    mouse.ball = -1;
  };

  const mousedownHandler = (e: MouseEvent) => {
    if (e.button === 0) {
      mouse.isBall = true;
    } else if (e.button === 2) {
      console.log("right button clicked");
    }
  };

  const mouseupHandler = (e: MouseEvent) => {
    if (e.button === 0) {
      mouse.isBall = false;
      mouse.ball = -1;
    }
  };

  canvas.addEventListener("mousedown", mousedownHandler);
  canvas.addEventListener("mouseup", mouseupHandler);
  // canvas.addEventListener("mouseenter", mouseenterHandler);
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

  let vx1New = vx1;
  let vy1New = vy1;
  let vx2New = vx2;
  let vy2New = vy2;

  const alpha = y2 !== y1 ? Math.atan2(x2 - x1, y2 - y1) : x2 > x1 ? 1 : -1;
  console.log(`alpha = ${Math.round((alpha * 180) / Math.PI)}`);
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
    (vx2alpha * Math.cos(alpha) - uy2alpha * Math.sin(alpha)) *
    attenuationRatio;
  vy2New =
    (-vx2alpha * Math.sin(alpha) + uy2alpha * Math.cos(alpha)) *
    attenuationRatio;

  return { vx1New, vy1New, vx2New, vy2New };
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
type Config = {
  qty: number;
  minR: number;
  maxR: number;
  H: number;
  W: number;
  attenuationRatio: number;
  ctx: CanvasRenderingContext2D;
};

type Border = "left" | "top" | "right" | "bottom" | null;

export class Ball {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  attenuationRatio: number;
  collapseWith: Set<number>;
  private border: Border;

  constructor(
    id: number,
    x0: number,
    y0: number,
    r: number,
    color: string,
    attenuationRatio: number
  ) {
    this.id = id;
    this.x = x0;
    this.y = y0;
    this.r = r;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.attenuationRatio = attenuationRatio;
    this.collapseWith = new Set<number>();
    this.border = null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  private setBorder(brd: Border) {
    this.border = brd;
    const delay = setTimeout(() => {
      this.border = null;
      return () => clearTimeout(delay);
    }, 300);
  }

  handleBorderTouch(W: number, H: number) {
    if (this.x - this.r <= 0 && this.border !== "left") {
      this.vx = -this.vx * this.attenuationRatio;
      this.vy = this.vy * this.attenuationRatio;
      this.setBorder("left");
    }

    if (this.x + this.r >= W && this.border !== "right") {
      this.vx = -this.vx * this.attenuationRatio;
      this.vy = this.vy * this.attenuationRatio;
      this.setBorder("right");
    }

    if (this.y - this.r <= 0 && this.border !== "top") {
      this.vy = -this.vy * this.attenuationRatio;
      this.vx = this.vx * this.attenuationRatio;
      this.setBorder("top");
    }

    if (this.y + this.r >= H && this.border !== "bottom") {
      this.vy = -this.vy * this.attenuationRatio;
      this.vx = this.vx * this.attenuationRatio;
      this.setBorder("bottom");
    }
  }

  // handleStroke(mouse: Mouse) {
  //   const distToMouse =
  //     Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2) -
  //     this.r -
  //     mouse.r;

  //   if (distToMouse <= 0 && mouse.isBall) {
  //     mouse.isBall = false;

  //     const { vx1New, vy1New } = handleStroke({
  //       x1: this.x,
  //       y1: this.y,
  //       r1: this.r,
  //       vx1: this.vx,
  //       vy1: this.vy,
  //       x2: mouse.x,
  //       y2: mouse.y,
  //       r2: mouse.r,
  //       vx2: mouse.dX,
  //       vy2: mouse.dY,
  //       attenuationRatio: this.attenuationRatio,
  //     });
  //     this.vx = vx1New;
  //     this.vy = vy1New;
  //   }
  //   this.x += this.vx;
  //   this.y += this.vy;
  // }

  handleStroke(mouse: Mouse) {
    const distToMouse =
      Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2) -
      this.r

    if (distToMouse <= 0 && mouse.isBall && (mouse.ball === -1 || mouse.ball === this.id)) {
      mouse.ball = this.id
      this.x = mouse.x;
      this.y = mouse.y;
      this.vx = mouse.dX;
      this.vy = mouse.dY;
    }
  }

  static handleCollapse(ball1: Ball, ball2: Ball) {
    const isCollapse = ball1.collapseWith.has(ball2.id);

    const dist =
      Math.sqrt((ball1.x - ball2.x) ** 2 + (ball1.y - ball2.y) ** 2) -
      ball1.r -
      ball2.r;

    if (dist <= 0 && !isCollapse) {
      ball1.collapseWith.add(ball2.id);
      ball2.collapseWith.add(ball1.id);
      console.log(`balls ${ball1.id} and ${ball2.id} collapsed`);
      const { vx1New, vy1New, vx2New, vy2New } = handleCollapse({
        x1: ball1.x,
        y1: ball1.y,
        r1: ball1.r,
        vx1: ball1.vx,
        vy1: ball1.vy,
        x2: ball2.x,
        y2: ball2.y,
        r2: ball2.r,
        vx2: ball2.vx,
        vy2: ball2.vy,
        attenuationRatio: ball1.attenuationRatio,
      });
      ball1.vx = vx1New;
      ball1.vy = vy1New;
      ball2.vx = vx2New;
      ball2.vy = vy2New;
    }

    // ball1.x += ball1.vx;
    // ball1.y += ball1.vy;
    // ball2.x += ball2.vx;
    // ball2.y += ball2.vy;
    if (dist > 0) {
      ball1.collapseWith.delete(ball2.id);
      ball2.collapseWith.delete(ball1.id);
    }
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

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

const generateR = (minR: number, maxR: number) => {
  return Math.round(minR + Math.random() * (maxR - minR));
};

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

export const setBalls = (config: Config) => {
  const { qty, minR, maxR, H, W, attenuationRatio } = config;
  const balls: Ball[] = [];

  const isOverlapping = (x: number, y: number, r: number) => {
    return balls.some((ball) => {
      const distance =
        Math.sqrt((ball.x - x) ** 2 + (ball.y - y) ** 2) - ball.r - r;
      return distance < 0;
    });
  };

  const gR = () => generateR(minR, maxR);
  const gC = (r: number) =>
    generateCoordinates(r + 5, W - r - 5, r + 5, H - r - 5);

  // set first ball
  const r0 = gR();
  const { x: x0, y: y0 } = gC(r0);
  balls.push(new Ball(0, x0, y0, r0, generateColor(), attenuationRatio));

  if (qty === 1) {
    return balls;
  }

  //set other balls
  for (let i = 1; i < qty; i++) {
    const r = gR();
    let xI = Math.round(W / 2);
    let yI = Math.round(H / 2);
    do {
      const { x, y } = gC(r);
      (xI = x), (yI = y);
    } while (isOverlapping(xI, yI, r));
    balls.push(new Ball(i, xI, yI, r, generateColor(), attenuationRatio));
  }

  return balls;
};

// ---------------------------------------------------------
