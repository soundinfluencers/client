import React from "react";
import usercheck from "../../../../assets/bar-campaign-strategy/user-check.svg";

interface Props {}

export const ReachUi: React.FC<Props> = () => {
  return (
    <div className="UI-button">
      <img src={usercheck} alt="" />
      <p>Reach: 7.5M Followers</p>
    </div>
  );
};
