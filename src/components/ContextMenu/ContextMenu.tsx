import s from "./ContextMenu.module.css";
import useClickAway from "../../hooks/useClickAway";
import { useRef } from "react";
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

  const color = useRef(ball.color) 

  const onClose = () => {
    console.log('fire onClose')
    console.log(color.current)
    handleColorChange(color.current);
    closeContextMenu()
  };

  const contextMenuRef = useRef(null);
  useClickAway(contextMenuRef, onClose);

  return (
    <div
      ref={contextMenuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className={s.context_menu}
    >
      <input
        type="color"
        value={color.current}
        onChange={(e) => color.current = e.target.value}
        name="color"
        id={`color-${ball.id}`}
        
      />
    </div>
  );
}
