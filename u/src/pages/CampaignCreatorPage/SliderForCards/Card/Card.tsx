import React from "react";
import "./_card.scss";
import type { ApiOffer } from "../../../../types/creator-campaign/creator-campaign.types";
import { ButtonMain } from "../../../../components/ui/buttons/button/Button";
interface Props {
  dataCard: ApiOffer;
}

export const Card: React.FC<Props> = ({ dataCard }) => {
  return (
    <div className="card_campaign">
      <div className="card_campaign__head">
        {" "}
        <div className="card_campaign__head__titular">
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
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          className="button"
        />
      </div>
      <div className="block">
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
