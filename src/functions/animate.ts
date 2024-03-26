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
