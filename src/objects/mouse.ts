export class Mouse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  btnPressed: boolean;
  ball: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.btnPressed = false;
    this.ball = -1;
  }

  private setVx(vx: number) {
    this.vx = vx;
    const delay = setTimeout(() => {
      this.vx = 0;
      return () => clearTimeout(delay);
    }, 200);
  }

  private setVy(vy: number) {
    this.vy = vy;
    const delay = setTimeout(() => {
      this.vy = 0;
      return () => clearTimeout(delay);
    }, 200);
  }

  track(canvas: HTMLCanvasElement) {
    const { left, top } = canvas.getBoundingClientRect();
  
    const mousemoveHandler = (e: MouseEvent) => {
      this.x = e.clientX - left;
      this.y = e.clientY - top;
      this.setVx(e.movementX);
      this.setVy(e.movementY);
    };
  
    const mouseleaveHandler = () => {
      this.btnPressed = false;
      this.ball = -1;
    };
  
    const mousedownHandler = (e: MouseEvent) => {
      if (e.button === 0) {
        this.btnPressed = true;
      }
    };
  
    const mouseupHandler = (e: MouseEvent) => {
      if (e.button === 0) {
        this.btnPressed = false;
        this.ball = -1;
      }
    };
  
    canvas.addEventListener("mousedown", mousedownHandler);
    canvas.addEventListener("mouseup", mouseupHandler);
    canvas.addEventListener("mouseleave", mouseleaveHandler);
    canvas.addEventListener("mousemove", mousemoveHandler);
  }
}