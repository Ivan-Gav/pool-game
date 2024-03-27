import React, { useCallback, useEffect } from "react";

function useClickAway<T extends HTMLElement>(
  ref: React.RefObject<T>,
  onClickAway: () => void
) {
  const handleClickOutside = useCallback(
    (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway();
      }
    },
    [ref, onClickAway]
  );
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  });
}

export default useClickAway;
