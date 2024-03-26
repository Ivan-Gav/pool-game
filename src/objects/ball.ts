import {
  generateColor,
  generateRadius,
  generateCoordinates,
  getDistance,
  getSpeeds,
} from '../functions/utils';

import { Mouse } from './mouse';


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
  static balls: Ball[] = [];
  static attenuationRatio: number = 0.8;
  static W: number = 0;
  static H: number = 0;

  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  collapseWith: Set<number>;
  private border: Border;

  constructor(id: number, x0: number, y0: number, r: number, color: string) {
    this.id = id;
    this.x = x0;
    this.y = y0;
    this.r = r;
    this.color = color;
    this.vx = 0;
    this.vy = 0;

    this.collapseWith = new Set<number>();
    this.border = null;
  }

  static handleCollapse(ball1: Ball, ball2: Ball) {
    const isCollapse = ball1.collapseWith.has(ball2.id);
    const { distance } = getDistance(
      ball1.x,
      ball1.y,
      ball1.r,
      ball2.x,
      ball2.y,
      ball2.r
    );

    if (distance <= 0 && !isCollapse) {
      ball1.collapseWith.add(ball2.id);
      ball2.collapseWith.add(ball1.id);
      const { vx1New, vy1New, vx2New, vy2New } = getSpeeds({
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
        attenuationRatio: Ball.attenuationRatio,
      });
      ball1.vx = vx1New;
      ball1.vy = vy1New;
      ball2.vx = vx2New;
      ball2.vy = vy2New;
    }

    if (distance > 0) {
      ball1.collapseWith.delete(ball2.id);
      ball2.collapseWith.delete(ball1.id);
    }
  }

  static set(config: Config) {
    const { qty, minR, maxR, H, W, attenuationRatio } = config;
    this.balls = [];
    this.H = H;
    this.W = W;
    this.attenuationRatio = attenuationRatio;

    const isOverlapping = (x: number, y: number, r: number) => {
      return this.balls.some((ball) => {
        return getDistance(ball.x, ball.y, ball.r, x, y, r).isOverlapping;
      });
    };

    const gR = () => generateRadius(minR, maxR);
    const gC = (r: number) =>
      generateCoordinates(r + 5, W - r - 5, r + 5, H - r - 5);

    // set first ball
    const r0 = gR();
    const { x: x0, y: y0 } = gC(r0);
    this.balls.push(new Ball(0, x0, y0, r0, "#ffffff"));

    if (qty === 1) {
      return this.balls;
    }

    //set other balls
    for (let i = 1; i < qty; i++) {
      const r = gR();
      let xI = Math.round(W / 2);
      let yI = Math.round(H / 2);
      do {
        const { x, y } = gC(r);
        xI = x;
        yI = y;
      } while (isOverlapping(xI, yI, r));
      this.balls.push(new Ball(i, xI, yI, r, generateColor()));
    }

    return this.balls;
  }

  private setX(x: number) {
    let newX = x < this.r ? this.r : x > Ball.W - this.r ? Ball.W - this.r : x;
    if (this.collapseWith.size) {
      this.collapseWith.forEach((id) => {
        const b2 = Ball.balls[id];
        const dist =
          Math.sqrt((this.x - b2.x) ** 2 + (this.y - b2.y) ** 2) -
          this.r -
          b2.r;
        if (dist <= 0 && Math.abs(newX - b2.x) < Math.abs(this.x - b2.x)) {
          newX = this.x - (newX - this.x);
        }
      });
    }
    this.x = newX;
  }

  private setY(y: number) {
    let newY = y < this.r ? this.r : y > Ball.H - this.r ? Ball.H - this.r : y;
    if (this.collapseWith.size) {
      this.collapseWith.forEach((id) => {
        const b2 = Ball.balls[id];
        const dist =
          Math.sqrt((this.x - b2.x) ** 2 + (this.y - b2.y) ** 2) -
          this.r -
          b2.r;
        if (dist <= 0 && Math.abs(newY - b2.y) < Math.abs(this.y - b2.y)) {
          newY = this.y - (newY - this.y);
        }
      });
    }
    this.y = newY;
  }

  private setBorder(brd: Border) {
    this.border = brd;
    const delay = setTimeout(() => {
      this.border = null;
      return () => clearTimeout(delay);
    }, 300);
  }

  handleBorderTouch() {
    if (this.x - this.r <= 0 && this.border !== "left") {
      this.vx = -this.vx * Ball.attenuationRatio;
      this.vy = this.vy * Ball.attenuationRatio;
      this.setBorder("left");
    }

    if (this.x + this.r >= Ball.W && this.border !== "right") {
      this.vx = -this.vx * Ball.attenuationRatio;
      this.vy = this.vy * Ball.attenuationRatio;
      this.setBorder("right");
    }

    if (this.y - this.r <= 0 && this.border !== "top") {
      this.vy = -this.vy * Ball.attenuationRatio;
      this.vx = this.vx * Ball.attenuationRatio;
      this.setBorder("top");
    }

    if (this.y + this.r >= Ball.H && this.border !== "bottom") {
      this.vy = -this.vy * Ball.attenuationRatio;
      this.vx = this.vx * Ball.attenuationRatio;
      this.setBorder("bottom");
    }
  }

  handleStroke(mouse: Mouse) {
    const { isOverlapping } = getDistance(
      this.x,
      this.y,
      this.r,
      mouse.x,
      mouse.y,
      1
    );

    if (
      isOverlapping &&
      mouse.btnPressed &&
      (mouse.ball === -1 || mouse.ball === this.id) &&
      !this.collapseWith.size
    ) {
      mouse.ball = this.id;
      this.setX(mouse.x);
      this.setY(mouse.y);
      this.vx = mouse.vx;
      this.vy = mouse.vy;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.color;
    const grad = ctx.createRadialGradient(this.x + this.r / 4, this.y - this.r / 8, 0, this.x, this.y, this.r);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.8, this.color);
    grad.addColorStop(1, this.color);
    // ctx.fillStyle = this.color;
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  move() {
    this.setX(this.x + this.vx);
    this.setY(this.y + this.vy);
  }
}
