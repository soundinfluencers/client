import type { FC } from "react";
import "./_switch-button.scss";

export interface SwitchButtonProps {
  firstTitle: string;
  secondTitle: string;
  activeIndex: number;
  onClick: (index: number) => void;
}

export const SwitchButton: FC<SwitchButtonProps> = ({
  firstTitle,
  secondTitle,
  activeIndex,
  onClick,
}) => {
  const sliderStyle = {
    transform: activeIndex === 0 ? "translateX(0)" : "translateX(100%)",
  };

  return (
    <div className="switch-button">
      <div className="switch-button__slider" style={sliderStyle} />

      <div
        className={`switch-button__content ${
          activeIndex === 0 ? "active" : ""
        }`}
        onClick={() => onClick(0)}>
        <p>{firstTitle}</p>
      </div>

      <div
        className={`switch-button__content ${
          activeIndex === 1 ? "active" : ""
        }`}
        onClick={() => onClick(1)}>
        <p>{secondTitle}</p>
      </div>
    </div>
  );
};
