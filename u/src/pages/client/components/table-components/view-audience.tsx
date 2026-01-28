import React from "react";
import repeat from "@/assets/bar-campaign-strategy/repeat.svg";
import "./proposals-strategy.scss";
interface Props {
  onChange: () => void;
  flag: boolean;
}

export const ViewAudience: React.FC<Props> = ({ onChange, flag }) => {
  return (
    <div onClick={onChange} className="ViewAudience">
      <div className={`ViewAudience__btn ${flag ? "active" : ""}`}>
        <img src={repeat} alt="" />
        {flag ? (
          <p>See campaign stratagy</p>
        ) : (
          <p>See audience geolocation & music genres</p>
        )}
      </div>
    </div>
  );
};
