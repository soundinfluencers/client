import { useLayoutEffect } from "react";

export const useLockBodyScroll = (isLocked: boolean) => {
  useLayoutEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
};