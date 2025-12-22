import React from "react";
import CompletedIcon from "../../../../../../assets/bar-home/check-circle.svg";
interface Props {
  width: number;
}

export const Completed: React.FC<Props> = ({ width }) => {
  return (
    <div className={`action-button ${width > 870 ? "radius" : ""}`}>
      <img src={CompletedIcon} alt="" />
      <p>Completed</p>
      <div className="dot"></div>
    </div>
  );
};
