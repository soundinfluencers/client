import React from "react";
import type { PromoCard } from "../../../../../types/creator-campaign/creator-campaign.types";
import { getSocialMediaIcon } from "../../../../../constants/social-medias";
import type { SocialMediaType } from "../../../../../types/utils/constants.types";
import chevron from "../../../../../assets/icons/chevron-down.svg";
interface Props {
  data: PromoCard;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
  isSmall: boolean;
}
import "./_table_row_card.scss";
import { formatFollowers } from "../../../../../utils/functions/formatFollowers";
export const TableRowCard: React.FC<Props> = ({
  data,
  setIsSmall,
  isSmall,
}) => {
  React.useEffect(() => {
    const el = document.querySelector(`[data-id="${data._id}"]`);
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsSmall(width <= 896);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [data._id]);
  const renderTags = (arr: string[]) => {
    if (!isSmall || arr.length <= 1)
      return arr?.slice?.(0, 3)?.map((t, i) => (
        <span className="tag" key={i}>
          {t}
        </span>
      ));

    return (
      <>
        <div className="chevronPopUp">
          <img src={chevron} alt="" />
        </div>
      </>
    );
  };
  return (
    <div
      data-id={data._id}
      className={`promo-grid-row ${isSmall ? "adaptive" : ""}`}
      key={data._id}>
      <div className="name">
        <input type="checkbox" className="checkbox" />
        <span>{data.instagramUsername}</span>
      </div>

      <div className="price">
        <img src={data.logo} />
        <span>
          {data.price}
          {data.currency}
        </span>
      </div>

      <div className="followers">
        <img src={getSocialMediaIcon(data.socialMedia as SocialMediaType)} />
        <span>{formatFollowers(data.followersNumber)}</span>
      </div>

      <div className="genres">
        <div className="tags">
          {renderTags([
            ...(data?.musicSubStyles || []),
            ...(data?.musicStyleOther || []),
          ])}
        </div>
      </div>

      <div className="countries">
        <div className="tags">
          {renderTags(
            data?.countries?.map((c) => `${c.country} ${c.percentage}%`)
          )}
        </div>
      </div>
    </div>
  );
};
