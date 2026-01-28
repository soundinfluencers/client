import React from "react";
import check from "@/assets/icons/check (1).svg";
import "./checkbox.scss";
interface Props {
  name: string;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<Props> = ({ name, isChecked, onChange }) => {
  return (
    <label className="AutoReplace">
      <div className="input">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e?.target?.checked || false)}
        />
        <img className={isChecked ? "checked" : ""} src={check} alt="" />
      </div>

      {name}
    </label>
  );
};
