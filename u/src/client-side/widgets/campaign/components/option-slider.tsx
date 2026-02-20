import React from "react";
import "./option-slider.scss";
import chevron from "@/assets/icons/chevron-right.svg";
import x from "@/assets/icons/x.svg";
import { deleteProposalOption } from "@/api/client/campaign/campaign.api";
import { toast } from "react-toastify";
type Props = {
  optionIndexes: number[];
  activeOption: number;
  onClickOption: (idx: number) => void;

  onDeleteOption: (idx: number) => void;
};

export function OptionsSlider({
  optionIndexes,
  activeOption,
  onClickOption,

  onDeleteOption,
}: Props) {
  const scrollerRef = React.useRef<HTMLUListElement | null>(null);
  const [canScroll, setCanScroll] = React.useState(false);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const update = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const can = el.scrollWidth > el.clientWidth + 1;
    setCanScroll(can);

    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [update, optionIndexes.length]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <div className="options-slider">
      {canScroll && (
        <button
          type="button"
          className="options-slider__arrow left"
          onClick={() => scrollByPage(-1)}
          disabled={atStart}
          aria-label="Scroll left">
          <img style={{ transform: "rotate(180deg)" }} src={chevron} alt="" />
        </button>
      )}
      <ul ref={scrollerRef} className="option-list option-list--scroll">
        {optionIndexes.map((idx) => (
          <li
            key={idx}
            className={activeOption === idx ? "active-option" : ""}
            onClick={() => onClickOption(idx)}>
            Option {idx + 1}
            <img
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOption(idx);
              }}
              src={x}
              alt=""
            />
          </li>
        ))}
      </ul>
      {canScroll && (
        <button
          type="button"
          className="options-slider__arrow right"
          onClick={() => scrollByPage(1)}
          disabled={atEnd}
          aria-label="Scroll right">
          <img src={chevron} alt="" />
        </button>
      )}{" "}
    </div>
  );
}
