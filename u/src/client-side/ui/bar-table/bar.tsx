import React from "react";
import edit from "@/assets/bar-campaign-strategy/edit-3.svg";
import creditcard from "@/assets/bar-campaign-strategy/credit-card.svg";
import calendar from "@/assets/bar-campaign-strategy/calendar.svg";
import video from "@/assets/bar-campaign-strategy/video.svg";
import usercheck from "@/assets/bar-campaign-strategy/user-check.svg";
import "../styles/table-components.scss";

import { formatCampaignDate } from "@/utils/functions/formatDate";
import { useCampaignStore } from "@/store/client/create-campaign";
import { formatFollowers } from "@/utils/functions/formatFollowers";

export const Bar = () => {
  const { campaignContent, promoCard, totalPrice } = useCampaignStore();

  const totalFollowers = React.useMemo(
    () => promoCard.reduce((sum, n) => sum + Number(n.followers ?? 0), 0),
    [promoCard],
  );

  const barUIs = [
    {
      name: `Submitted: ${formatCampaignDate(String(new Date()))}`,
      img: calendar,
    },
    { name: `Budget: ${totalPrice}`, img: creditcard },
    {
      name: `Reach: ${formatFollowers(totalFollowers)} followers`,
      img: usercheck,
    },
    { name: `Posts: ${promoCard.length}`, img: edit },
    { name: `Video: ${campaignContent.length}`, img: video },
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
