import React from "react";
import editIcon from "@/assets/icons/edit.svg";
interface Props {
  onChange: () => void;
  active: boolean;
}
import "./_edit.scss";
export const Edit: React.FC<Props> = ({ onChange, active }) => {
  return (
    <div onClick={onChange} className={`edit ${active ? "active" : ""}`}>
      <p>Edit</p>
      <img src={editIcon} alt="" />
    </div>
  );
};
