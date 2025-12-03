import React from "react";
import type { PromoCard } from "../../../../../types/creator-campaign/creator-campaign.types";
import { getSocialMediaIcon } from "../../../../../utils/constants/social-medias";
import type { SocialMediaType } from "../../../../../types/utils/constants.types";

interface Props {
  data: PromoCard;
}
import "./_table_row_card.scss";
export const TableRowCard: React.FC<Props> = ({ data }) => {
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

  return (
    <tr className="table-row">
      {/* NAME + CHECKBOX */}
      <td className="name">
        <input type="checkbox" className="checkbox" />
        <span>{data.instagramUsername}</span>
      </td>

      {/* PRICE */}
      <td className="price">
        <img src={data.logo} alt="" className="price-icon" />
        <span>
          {data.price}
          {data.currency}
        </span>
      </td>

      {/* FOLLOWERS */}
      <td className="followers">
        {" "}
        <img
          src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
          alt=""
        />
        {formatFollowers(data.followersNumber)}
      </td>

      {/* GENRES */}
      <td className="genres">
        <div className="tags">
          {data.musicSubStyles.map((item, i) => (
            <span className="tag" key={i}>
              {item}
            </span>
          ))}
          {data.musicStyleOther.map((item, i) => (
            <span className="tag" key={i}>
              {item}
            </span>
          ))}
        </div>
      </td>

      {/* COUNTRIES */}
      <td className="countries">
        <div className="tags">
          {data.countries.map((cr, i) => (
            <span className="tag" key={i}>
              {cr.country} {cr.percentage}%
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
};
