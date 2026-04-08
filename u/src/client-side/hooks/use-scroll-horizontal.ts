import { useEffect, useRef, useState } from "react";

export const useHorizontalScroll = () => {
  const ref = useRef<HTMLUListElement | null>(null);

  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;

      setShowRightArrow(
          hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      );
      setShowLeftArrow(hasOverflow && el.scrollLeft > 0);
    };

    check();

    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(el);

    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollRight = (offset = 150) => {
    ref.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  const scrollLeft = (offset = 150) => {
    ref.current?.scrollBy({ left: -offset, behavior: "smooth" });
  };

  return {
    ref,
    showRightArrow,
    showLeftArrow,
    scrollRight,
    scrollLeft,
  };
};