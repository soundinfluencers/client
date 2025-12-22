import React from "react";
import check from "../../../assets/icons/check (1).svg";
import "./checkbox.scss";
interface Props {
  name: string;
}

export const Checkbox: React.FC<Props> = ({ name }) => {
  return (
    <div className="AutoReplace">
      <div className="input">
        <input type="checkbox" id={name} />
        <img src={check} alt="" />
      </div>
      <label htmlFor={name}>{name}</label>
    </div>
  );
};
