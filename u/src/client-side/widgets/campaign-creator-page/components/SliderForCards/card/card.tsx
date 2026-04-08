import React from "react";
import "./_card.scss";


import { ButtonMain } from "@/components/ui/buttons/button/Button";
import { useCampaignStore } from "@/client-side/store";
import type {Offer} from "@/client-side/types/offers.ts";

interface Props {
  dataCard: Offer;
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
          }`}
      >
        <div className="campaign-card__header">
          <div className="campaign-card__title-section">
            <h2>{dataCard.title}</h2>
            <p>€{dataCard.price}</p>
          </div>

          <ul>
            <li>{dataCard.storyAndPostDetails}</li>
            <li>{dataCard.networksAmount} networks with</li>
            <li>{dataCard.combinedFollowers} Followers Combined</li>
          </ul>

          <ButtonMain
              text="Choose"
              onClick={onChoose}
              className="button"
          />
        </div>

        <div className="campaign-card__accounts">
          <ul>
            {dataCard.connectedAccounts.map((account) => (
                <li key={account.accountId}>
                  <img src={account.logoUrl} alt="" />
                  {account.username}
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
};