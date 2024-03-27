import { useEffect, useRef, useState } from "react";
import s from "./Table.module.css";
import { animate } from "../../functions/animate";
import { Ball } from "../../objects/ball";
import { Mouse } from "../../objects/mouse";
import ContextMenu from "../ContextMenu/ContextMenu";
import { getDistance } from "../../functions/utils";

const initialContextMenu = {
  show: false,
  x: 0,
  y: 0,
};

export default function Table(
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canRef = useRef<HTMLCanvasElement | null>(null);
  const [ballsState, setBallsState] = useState<Ball[]>([]);
  const [contextMenu, setContextMenu] = useState(initialContextMenu);
  const [clickedBall, setClickedBall] = useState<Ball | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { left, top } = canRef.current
      ? canRef.current.getBoundingClientRect()
      : { left: 0, top: 0 };
    if (ballsState.length) {
      const clicked = ballsState.find(
        (ball) =>
          getDistance(ball.x, ball.y, ball.r, clientX - left, clientY - top, 0)
            .isOverlapping
      );
      if (clicked) {
        setClickedBall(clicked);
        setContextMenu({ show: true, x: clientX, y: clientY });
        console.log(`clicked ball №${clicked.id}`);
      }
    }
  };

  const closeContextMenu = () => setContextMenu(initialContextMenu);

  const handleColorChange = (color: string) => {
    setContextMenu(initialContextMenu);
    if (clickedBall instanceof Ball) {
      const ball = Object.assign(
        Object.create(Object.getPrototypeOf(clickedBall)),
        clickedBall
      );
      ball.color = color;
      Ball.setBall(ball);
      setClickedBall(null);
    }
  };

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
    setBallsState(balls);

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
        setBallsState(balls);
      },
      render() {
        balls.forEach((ball) => ball.draw(ctx));
      },
    });
  }, []);

  return (
    <>
      {contextMenu.show && !!clickedBall && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          closeContextMenu={closeContextMenu}
          ball={clickedBall}
          handleColorChange={handleColorChange}
        />
      )}
      <canvas
        onContextMenu={handleContextMenu}
        className={s.table}
        ref={canRef}
        {...props}
      />
    </>
  );
}
