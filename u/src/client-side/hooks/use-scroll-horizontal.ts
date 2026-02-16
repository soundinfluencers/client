import { useEffect, useRef, useState } from "react";

export const useHorizontalScroll = () => {
  const ref = useRef<HTMLUListElement | null>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkOverflow = () => {
      setShowArrow(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const scrollRight = (offset = 150) => {
    const el = ref.current;
    if (!el) return;

    el.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return { ref, showArrow, scrollRight };
};
