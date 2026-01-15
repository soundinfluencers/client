import React from "react";
import edit from "@/assets/bar-campaign-strategy/edit-3.svg";
import creditcard from "@/assets/bar-campaign-strategy/credit-card.svg";
import calendar from "@/assets/bar-campaign-strategy/calendar.svg";
import video from "@/assets/bar-campaign-strategy/video.svg";
import usercheck from "@/assets/bar-campaign-strategy/user-check.svg";
import "./proposals-strategy.scss";
interface Props {}

export const Bar: React.FC<Props> = () => {
  const barUIs = [
    { name: "Submitted: Oct 7, 2025", img: calendar },
    { name: "Budget: 1,599 €", img: creditcard },
    { name: "Reach: 7.5M followers", img: usercheck },
    { name: "Posts: 21", img: edit },
    { name: "Video: 2", img: video },
  ];
  return (
    <div className="bar-strategy-proposals">
      {barUIs.map((item, i) => (
        <div key={i} className="UI-button">
          <img src={item.img} alt="" />
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
};
