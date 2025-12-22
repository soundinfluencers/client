import React from "react";
import draft from "../../../../../../assets/bar-home/folder-plus (1).svg";
interface Props {}

export const Drafts: React.FC<Props> = () => {
  return (
    <div className="action-button">
      <img src={draft} alt="" />
      <p>Drafts</p>
      <div className="dot"></div>
    </div>
  );
};
