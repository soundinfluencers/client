import React from "react";
import calendar from "../../../../assets/bar-campaign-strategy/calendar.svg";

interface Props {}

export const SubmittedUi: React.FC<Props> = () => {
  return (
    <div className="UI-button">
      <img src={calendar} alt="" />
      <p>Submitted: Oct 7,2025</p>
    </div>
  );
};
