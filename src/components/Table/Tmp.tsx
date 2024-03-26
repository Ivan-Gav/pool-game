import { useEffect, useRef } from "react";
import s from "./Table.module.css";
import {
  drawBall,
  animate,
  trackMouse,
  // handleCollapse,
  handleStroke,
} from "../../functions/animate";

type Vel = {
  dX: number;
  dY: number;
};

type Border = "left" | "top" | "right" | "bottom" | null;

type BorderFlagType = {
  border: Border;
  setBorder: (brd: Border) => void;
};

export default function Table(
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const [W, H] = [canvas.width, canvas.height];

    ctx.clearRect(0, 0, W, H);

    // config
    const v: Vel = { dX: 0, dY: 0 }; // initial speed
    const startX = 250;
    const startY = 250;
    const r = 15;
    const attenuationRatio = 0.8;
    const cursorR = 12;
    const cursorColor = "#fff";
    const col = "orange"; // let col = "orange";

    let dx = 0;
    let dy = 0;
    let vx = v.dX;
    let vy = v.dY;

    const borderFlag: BorderFlagType = {
      border: null,
      setBorder(brd: Border) {
        this.border = brd;
        const delay = setTimeout(() => {
          this.border = null;
          return () => clearTimeout(delay);
        }, 300);
      },
    };

    let collapseFlag = false;

    const mouse = trackMouse(canvas);

    animate({
      clear() {
        ctx.clearRect(0, 0, W, H);
      },
      update({ timestamp }) {
        const x = startX + dx;
        const y = startY + dy;

        // handle border touches
        if (x - r <= 0 && borderFlag.border !== "left") {
          vx = -(vx * attenuationRatio);
          vy = vy * attenuationRatio;
          borderFlag.setBorder("left");
        }

        if (x + r >= W && borderFlag.border !== "right") {
          vx = -(vx * attenuationRatio);
          vy = vy * attenuationRatio;
          borderFlag.setBorder("right");
        }

        if (y - r <= 0 && borderFlag.border !== "top") {
          vy = -(vy * attenuationRatio);
          vx = vx * attenuationRatio;
          borderFlag.setBorder("top");
        }

        if (y + r >= H && borderFlag.border !== "bottom") {
          vy = -(vy * attenuationRatio);
          vx = vx * attenuationRatio;
          borderFlag.setBorder("bottom");
        }
        // -------------------------------------------------

        // handle mouse hits
        const distToMouse =
          Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2) - r - cursorR;

        // -------------hit-------------
        if (distToMouse <= 1 && mouse.ball && !collapseFlag) {
          mouse.ball = false;
          collapseFlag = true;
          const vxm = vx;
          const vym = vy;
          vx = 0;
          vy = 0;

          const isMouseMoving = !!timestamp && timestamp - mouse.timestamp < 10;
          const mouseVx = isMouseMoving ? mouse.dX : 0;
          const mouseVy = isMouseMoving ? mouse.dY : 0;

          const { vx1New, vy1New } = handleStroke({
            x1: x,
            y1: y,
            r1: r,
            vx1: vxm,
            vy1: vym,
            x2: mouse.x,
            y2: mouse.y,
            r2: cursorR,
            vx2: mouseVx,
            vy2: mouseVy,
            attenuationRatio,
          });
          vx = vx1New;
          vy = vy1New;
        } else {
          if (distToMouse > 1) {
            collapseFlag = false;
          }
        }
        dx += vx;
        dy += vy;
      },
      render() {
        drawBall(ctx, startX + dx, startY + dy, r, col);
        if (mouse.ball && !collapseFlag) {
          drawBall(ctx, mouse.x, mouse.y, cursorR, cursorColor);
        }
      },
    });
  }, []);

  return <canvas className={s.table} ref={canRef} {...props} />;
}
