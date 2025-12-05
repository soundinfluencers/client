import React from "react";
import "./_card.scss";
import type { ApiOffer } from "../../../../types/creator-campaign/creator-campaign.types";
import { ButtonMain } from "../../../../components/ui/buttons/button/Button";
import { useFormDataOffer } from "../../../../store/createCampaign";
interface Props {
  dataCard: ApiOffer;
}

export const Card: React.FC<Props> = ({ dataCard }) => {
  const { setActiveOffer, activeOfferId, setOffer, offer } = useFormDataOffer();
  console.log(offer);
  return (
    <div
      className={`campaign-card ${
        activeOfferId === dataCard._id ? "active" : ""
      }`}>
      <div className="campaign-card__header">
        <div className="campaign-card__title-section">
          <h2>{dataCard.title}</h2>
          <p>{dataCard.price} €</p>
        </div>
        <ul>
          <li>{dataCard.storyAndPostDetails}</li>
          <li>{dataCard.networksAmount} networks with</li>
          <li>{dataCard.combinedFollowers} Followers Combined</li>
        </ul>
        <ButtonMain
          text={"Choose"}
          onClick={() => {
            setOffer(dataCard);
            setActiveOffer(dataCard._id);
          }}
          className="button"
        />
      </div>
      <div className="campaign-card__accounts">
        <ul>
          {dataCard.connectedAccounts.map((acc, i) => (
            <li key={i}>
              <img src={acc.logo} alt="" />
              {acc.socialMediaUsername}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
