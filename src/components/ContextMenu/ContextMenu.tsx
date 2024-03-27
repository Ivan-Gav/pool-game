import s from "./ContextMenu.module.css";
import useClickAway from "../../hooks/useClickAway";
import { useRef, useState } from "react";
import { Ball } from "../../objects/ball";

type ContextMenuProps = {
  x: number;
  y: number;
  ball: Ball;
  closeContextMenu: () => void;
  handleColorChange: (color: string) => void;
};

export default function ContextMenu(props: ContextMenuProps) {
  const { x, y, closeContextMenu, ball, handleColorChange } = props;

  const [color, setColor] = useState(ball.color);
  const colorRef = useRef(ball.color);
  const contextMenuRef = useRef(null);

  const onClose = () => {
    handleColorChange(colorRef.current);
    closeContextMenu();
  };

  useClickAway(contextMenuRef, onClose);

  return (
    <div
      ref={contextMenuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className={s.context_menu}
    >
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          colorRef.current = e.target.value;
        }}
        name="color"
        id={`color-${ball.id}`}
      />
    </div>
  );
}
