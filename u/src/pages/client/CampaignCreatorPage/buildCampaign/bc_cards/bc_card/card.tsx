import React from "react";
import "./_card-bc_card.scss";
import type { IPromoCard } from "../../../../../../types/creator-campaign/creator-campaign.types";
import { getSocialMediaIcon } from "../../../../../../constants/social-medias";
import chevronDown from "../../../../../../assets/icons/chevron-down.svg";
import type { SocialMediaType } from "../../../../../../types/utils/constants.types";
import { formatFollowers } from "../../../../../../utils/functions/formatFollowers";
import { GenresCountries } from "../../../ui/genre-countries/genre-countries";
import { useFormDataOffer } from "../../../../../../store/client/createCampaign";
interface Props {
  data: IPromoCard;
  view: number;
}

export const Card: React.FC<Props> = ({ data, view }) => {
  const { setPromoCard, promoCard } = useFormDataOffer();
  const activePromo = promoCard.find((card) => card._id === data._id);
  const [flag, setFlag] = React.useState<boolean>(false);
  const hasGenres =
    (data.musicSubStyles && data.musicSubStyles.length > 0) ||
    (data.musicStyleOther && data.musicStyleOther.length > 0);
  const hasCountries = data.countries && data.countries.length > 0;
  return (
    <div
      onClick={() => setPromoCard(data)}
      className={`bc_card ${flag ? "open" : ""} ${
        activePromo ? "active" : ""
      }`}>
      <div className="bc_card__head">
        <div className="cost">
          <img src={data.logo} alt="" />
          <p>
            {data.price}
            {data.currency}
          </p>
        </div>
        <div className="social">
          <img
            src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
            alt=""
          />
          <p>{formatFollowers(data.followersNumber)}</p>
        </div>
      </div>
      <div className="information">
        <div className="overflow">
          {" "}
          <p>{data.instagramUsername}</p>
        </div>

        <div className="genresIcountries">
          <div
            onClick={() => setFlag((prev) => !prev)}
            className="genresIcountries__head">
            <p>Genres, Countries</p>
            {hasGenres && hasCountries && (
              <img className={flag ? "active" : ""} src={chevronDown} alt="" />
            )}
          </div>
        </div>
        {flag && hasGenres && hasCountries && <GenresCountries data={data} />}
      </div>
    </div>
  );
};
