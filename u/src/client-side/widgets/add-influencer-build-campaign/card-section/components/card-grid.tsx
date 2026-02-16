import React from "react";
import "./_card-bc_card.scss";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";
import { getSocialMediaIcon } from "@/constants/social-medias";
import chevronDown from "@/assets/icons/chevron-down.svg";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";

import { useBuildCampaignFilters } from "@/store/client/create-campaign/useBuildCampaignFilters";

import { getPriceByCurrency } from "@/client-side/utils";
import { useSelectCampaignProposal } from "@/client-side/store";
import { GenresCountries } from "@/shared/ui";
interface Props {
  data: IPromoCard;
  isInclude: boolean;
}

export const Card: React.FC<Props> = ({ data, isInclude }) => {
  const { actions, promoCard } = useSelectCampaignProposal();
  const { selectedCurrency } = useBuildCampaignFilters();
  const activePromo = promoCard.find(
    (card) => card.accountId === data.accountId,
  );
  const [flag, setFlag] = React.useState<boolean>(false);
  const hasGenres = data.musicGenres && data.musicGenres.length > 0;
  const hasCountries = data.countries && data.countries.length > 0;
  return (
    <div
      onClick={() => {
        if (isInclude) return null;
        else actions.setPromoCards(data);
      }}
      className={`bc_card ${flag ? "open" : ""} ${isInclude ? "include" : ""} ${
        activePromo ? "active" : ""
      }`}>
      <div className="bc_card__head">
        <div className="cost">
          <img src={data.logoUrl} alt="" />
          <p>
            {getPriceByCurrency(data.prices, selectedCurrency)}
            {selectedCurrency.key}
          </p>
        </div>
        <div className="social">
          <img
            src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
            alt=""
          />
          <p>{formatFollowers(data.followers)}</p>
        </div>
      </div>
      <div className="information">
        <div className="overflow">
          {" "}
          <p>{data.username}</p>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="genresIcountries">
          {hasGenres && hasCountries && (
            <div
              onClick={() => setFlag((prev) => !prev)}
              className="genresIcountries__head">
              <p>Genres, Countries</p>
              <img className={flag ? "active" : ""} src={chevronDown} alt="" />
            </div>
          )}
        </div>
        {flag && hasGenres && hasCountries && (
          <GenresCountries
            setOpen={setFlag}
            isInclude={isInclude}
            activePromo={activePromo}
            data={data}
          />
        )}{" "}
      </div>
      {isInclude && (
        <div className="included-text">
          <p>Included in your selected offer</p>
        </div>
      )}
    </div>
  );
};
