import React from "react";
import "./_card.scss";

import type { IApiOffer } from "@/types/client/creator-campaign/creator-campaign.types";
import { ButtonMain } from "@/components/ui/buttons/button/Button";
import { useCampaignStore } from "@/client-side/store";

interface Props {
  dataCard: IApiOffer;
}

export const Card: React.FC<Props> = ({ dataCard }) => {
  const activeOfferId = useCampaignStore((s) => s.activeOfferId);
  const setOffer = useCampaignStore((s) => s.actions.setOffer);

  const onChoose = React.useCallback(() => {
    setOffer(dataCard);
  }, [setOffer, dataCard]);
  return (
    <div
      className={`campaign-card ${
        activeOfferId === dataCard._id ? "active" : ""
      }`}>
      <div className="campaign-card__header">
        <div className="campaign-card__title-section">
          <h2>{dataCard.title}</h2>
          <p>€{dataCard.price}</p>
        </div>
        <ul>
          <li>{dataCard.storyAndPostDetails}</li>
          <li>{dataCard.networksAmount} networks with</li>
          <li>{dataCard?.combinedFollowers} Followers Combined</li>
        </ul>
        <ButtonMain
          text={"Choose"}
          onClick={() => onChoose()}
          className="button"
        />
      </div>
      <div className="campaign-card__accounts">
        <ul>
          {dataCard.connectedAccounts.map((acc, i) => (
            <li key={i}>
              <img src={acc.logoUrl} alt="" />
              {acc.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
