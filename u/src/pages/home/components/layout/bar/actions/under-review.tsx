import React from "react";
import UnderReviewIcon from "../../../../../../assets/bar-home/si_hourglass-duotone.svg";
interface Props {}

export const UnderReview: React.FC<Props> = () => {
  return (
    <div className="action-button">
      <img src={UnderReviewIcon} alt="" />
      <p>Under Review</p>
      <div className="dot"></div>
    </div>
  );
};
