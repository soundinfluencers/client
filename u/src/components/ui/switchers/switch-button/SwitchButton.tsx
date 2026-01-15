import type { FC } from "react";
import "./_switch-button.scss";
import { useLoginStore } from "../../../../store/features/loginSlice";

export interface SwitchButtonProps {
  firstTitle: string;
  secondTitle: string;
}

export const SwitchButton: FC<SwitchButtonProps> = ({
  firstTitle,
  secondTitle,
}) => {
  const { role, setRole } = useLoginStore();

  const sliderStyle = {
    transform: role === "client" ? "translateX(0)" : "translateX(100%)",
  };

  return (
    <div className="switch-button">
      <div className="switch-button__slider" style={sliderStyle} />

      <div
        className={`switch-button__content ${
          role === "client" ? "active" : ""
        }`}
        onClick={() => setRole("client")}>
        <p>{firstTitle}</p>
      </div>

      <div
        className={`switch-button__content ${
          role === "influencer" ? "active" : ""
        }`}
        onClick={() => setRole("influencer")}>
        <p>{secondTitle}</p>
      </div>
    </div>
  );
};
