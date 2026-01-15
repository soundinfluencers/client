import type { FC } from "react";
import "./_switch-button.scss";
import type { UserRoleType } from "@/types/user/user.types";
export interface SwitchButtonProps {
  firstTitle: string;
  secondTitle: string;
  activeRole: UserRoleType;
  onClick: (role: UserRoleType) => void;
}
export const SwitchButton: FC<SwitchButtonProps> = ({
  firstTitle,
  secondTitle,
  activeRole,
  onClick,
}) => {
  const sliderStyle = {
    transform: activeRole === "client" ? "translateX(0)" : "translateX(100%)",
  };
  return (
    <div className="switch-button">
      <div className="switch-button__slider" style={sliderStyle} />
      <div
        className={`switch-button__content ${
          activeRole === "client" ? "active" : ""
        }`}
        onClick={() => onClick("client")}>
        <p>{firstTitle}</p>
      </div>
      <div
        className={`switch-button__content ${
          activeRole === "influencer" ? "active" : ""
        }`}
        onClick={() => onClick("influencer")}>
        <p>{secondTitle}</p>
      </div>
    </div>
  );
};