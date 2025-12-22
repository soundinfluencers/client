import React from "react";
import repeat from "../../../../assets/bar-campaign-strategy/repeat.svg";
interface Props {}

export const ViewAudience: React.FC<Props> = () => {
  return (
    <div className="ViewAudience">
      <div className="ViewAudience__btn">
        <img src={repeat} alt="" />
        <p>See audience geolocation & music genres</p>
      </div>
    </div>
  );
};
