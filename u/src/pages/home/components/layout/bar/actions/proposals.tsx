import React from "react";
import edit from "../../../../../../assets/bar-home/edit-2.svg";
interface Props {}

export const Proposals: React.FC<Props> = () => {
  return (
    <div className="action-button">
      <img src={edit} alt="" />
      <p>Proposals</p>
      <div className="dot"></div>
    </div>
  );
};
