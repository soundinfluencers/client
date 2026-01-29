import React from "react";
import repeat from "@/assets/bar-campaign-strategy/repeat.svg";
import "./ui-tables.scss";
interface Props {
  onChange: () => void;
  flag: boolean;
}

export const ToggleTables: React.FC<Props> = ({ onChange, flag }) => {
  return (
    <div className="toggleTables">
      <div
        onClick={onChange}
        className={`toggleTables__btn ${flag ? "active" : ""}`}>
        <img src={repeat} alt="" />
        {flag ? <p>Campaign insights</p> : <p>Campaign Strategy</p>}
      </div>
    </div>
  );
};
