import React from "react";
import repeat from "@/assets/icons/Vector (14).svg";
import "../styles/table-components.scss";

interface Props {
  onChange: () => void;
  flag: boolean;
}

export const ViewAudience: React.FC<Props> = ({ onChange, flag }) => {
  return (
    <div className="ViewAudience">
      <div
        onClick={onChange}
        className={`ViewAudience__btn ${flag ? "active" : ""}`}>
        <img src={repeat} alt="" />
        <p>Advanced Insights</p>
      </div>
    </div>
  );
};
