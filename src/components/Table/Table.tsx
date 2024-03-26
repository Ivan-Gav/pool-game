import { useEffect, useRef } from "react";
import s from "./Table.module.css";
import { animate } from "../../functions/animate";
import { Ball } from "../../objects/ball";
import { Mouse } from "../../objects/mouse";

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

    const ballsConfig = {
      qty: 15,
      minR: 10,
      maxR: 16,
      H,
      W,
      attenuationRatio: 0.8,
      ctx,
    };

    const balls = Ball.set(ballsConfig);

    const mouse = new Mouse();
    mouse.track(canvas);

    animate({
      clear() {
        ctx.clearRect(0, 0, W, H);
      },
      update() {
        balls.forEach((ball) => {
          ball.handleBorderTouch();
          ball.handleStroke(mouse);
          balls
            .filter((item) => item.id > ball.id)
            .forEach((item) => Ball.handleCollapse(item, ball));
          ball.move();
        });
      },
      render() {
        balls.forEach((ball) => ball.draw(ctx));
      },
    });
  }, []);

  return <canvas className={s.table} ref={canRef} {...props} />;
}
