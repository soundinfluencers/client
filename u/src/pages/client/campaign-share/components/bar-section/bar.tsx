import React from "react";
import edit from "@/assets/bar-campaign-strategy/edit-3.svg";
import creditcard from "@/assets/bar-campaign-strategy/credit-card.svg";
import calendar from "@/assets/bar-campaign-strategy/calendar.svg";
import video from "@/assets/bar-campaign-strategy/video.svg";
import usercheck from "@/assets/bar-campaign-strategy/user-check.svg";
import "../../../scss-campaign-table/campaignBase.scss";

import type { CampaignResponse } from "@/types/store/index.types";
import { formatCampaignDate } from "@/utils/functions/formatDate";
import { formatFollowers } from "@/utils/functions/formatFollowers";
interface Props {
  campaign: CampaignResponse;
}

export const Bar: React.FC<Props> = ({ campaign }) => {
  const barUIs = [
    {
      name: `Submitted: ${formatCampaignDate(campaign.creationDate)}`,
      img: calendar,
    },
    { name: `Budget: ${campaign.price}`, img: creditcard },
    {
      name: `Reach: ${formatFollowers(campaign.totalFollowers)} followers`,
      img: usercheck,
    },
    { name: `Posts: ${campaign.addedAccounts.length}`, img: edit },
    { name: `Video: ${campaign.campaignContent.length}`, img: video },
  ];
  return (
    <div className="bar-campaign-page">
      {barUIs.map((item, i) => (
        <div key={i} className="UI-button">
          <img src={item.img} alt="" />
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
};
