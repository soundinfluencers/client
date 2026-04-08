import React from "react";
import "./_card-bc_card.scss";
import { getSocialMediaIcon } from "@/constants/social-medias";
import chevronDown from "@/assets/icons/Vector (17).svg";
import { formatFollowers } from "@/utils/functions/formatFollowers";

import { getPriceByCurrency } from "@/client-side/utils";
import { GenresCountries } from "@/shared/ui";
import { useBuildCampaignFilters, useCampaignStore } from "@/client-side/store";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";
import type {SocialMedia} from "@/client-side/types/common.ts";
interface Props {
  data: ConnectedAccount;
  isInclude: boolean;
}

export const Card: React.FC<Props> = ({ data, isInclude }) => {
  const { actions, promoCard } = useCampaignStore();
  const { selectedCurrency } = useBuildCampaignFilters();
  const activePromo = promoCard.find(
    (card) => card.accountId === data.accountId,
  );
  const [flag, setFlag] = React.useState<boolean>(false);
  const hasGenres = (data.musicGenres?.length ?? 0) > 0;
  const hasCountries = (data.countries?.length ?? 0) > 0;
  const hasMeta = hasGenres || hasCountries;

  console.log(data);
  return (
    <div
      onClick={() => {
        if (isInclude) return null;
        else {
            console.log(data,'card-schose')
          actions.setPromoCards(data);
          actions.setPromoCardsUI(data);
        }
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
            src={getSocialMediaIcon(data.socialMedia as SocialMedia) || ''}
            alt=""
          />
          {data.socialMedia !== "press" && (
            <p>{formatFollowers(data.followers)}</p>
          )}
        </div>
      </div>
      <div className="information">
        <div className="overflow">
          <p>{data.username}</p>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="genresIcountries">
          {hasMeta && (
            <div
              onClick={() => setFlag((prev) => !prev)}
              className={`information__head ${flag ? "active" : ""}`}>
              <img src={chevronDown} alt="" />
            </div>
          )}
        </div>

        {flag && hasMeta && (
          <GenresCountries
            setOpen={setFlag}
            open={flag}
            data={{
              musicGenres: data.musicGenres ?? [],
              countries: data.countries ?? [],
            }}
            activePromo={activePromo}
            isInclude={isInclude}
          />
        )}
      </div>
      {isInclude && (
        <div className="included-text">
          <p>Included in your selected offer</p>
        </div>
      )}
    </div>
  );
};
