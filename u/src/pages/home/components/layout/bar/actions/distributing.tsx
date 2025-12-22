import React from "react";
import DistributingIcon from "../../../../../../assets/bar-home/distribution icon.svg";
interface Props {}

export const Distributing: React.FC<Props> = () => {
  return (
    <div className="action-button">
      <img src={DistributingIcon} alt="" />
      <p>Distributing</p>
      <div className="dot"></div>
    </div>
  );
};
