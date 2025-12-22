import React from "react";
import video from "../../../../assets/bar-campaign-strategy/video.svg";

interface Props {}

export const VideoUI: React.FC<Props> = () => {
  return (
    <div className="UI-button">
      <img src={video} alt="" />
      <p>Videos: 2</p>
    </div>
  );
};
