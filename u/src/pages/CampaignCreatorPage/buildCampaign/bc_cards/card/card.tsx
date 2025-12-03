import React from "react";
import "./_card-bc_card.scss";
import type { PromoCard } from "../../../../../types/creator-campaign/creator-campaign.types";
import { getSocialMediaIcon } from "../../../../../utils/constants/social-medias";
import chevronDown from "../../../../../assets/icons/chevron-down.svg";
import type { SocialMediaType } from "../../../../../types/utils/constants.types";
interface Props {
  data: PromoCard;
  view: number;
}

export const Card: React.FC<Props> = ({ data, view }) => {
  function formatFollowers(count: number | string): string {
    const num = typeof count === "string" ? parseInt(count, 10) : count;

    if (isNaN(num)) return "0";

    if (num < 1000) {
      return num.toString();
    } else if (num < 1_000_000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
  }
  const [flag, setFlag] = React.useState<boolean>(false);
  return (
    <div className={`bc_card ${flag ? "open" : ""}`}>
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
        <p>{data.instagramUsername}</p>
        <div className="genresIcountries">
          <div
            onClick={() => setFlag((prev) => !prev)}
            className="genresIcountries__head">
            <p>Genres, Countries</p>
            <img className={flag ? "active" : ""} src={chevronDown} alt="" />
          </div>
        </div>
        {flag && (
          <div className="information__popUp">
            <div className="genres">
              <h3>Genres</h3>
              <ul>
                {data.musicSubStyles.map((item, i) => (
                  <li>{item}</li>
                ))}
                {data.musicStyleOther.map((item, i) => (
                  <li>{item}</li>
                ))}
              </ul>
            </div>{" "}
            <div className="countries">
              <h3>Countries</h3>
              <ul>
                {data.countries.map((cr, i) => (
                  <li key={i}>
                    {cr.country} {cr.percentage}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
