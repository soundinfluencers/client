import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import chevron from "@/assets/icons/chevron-down.svg";
import "./_table_row_card.scss";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";
import { Checkbox } from "@/components";
import { getPriceByCurrency } from "./utils/usePriceCurrency";
import { useBuildCampaignFilters } from "@/store/client/createCampaign/useBuildCampaignFilters";
interface Props {
  data: IPromoCard;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
  isSmall: boolean;
  isInclude: boolean;
}
export const TableRowCard: React.FC<Props> = ({
  data,
  setIsSmall,
  isSmall,
  isInclude,
}) => {
  const { selectedCurrency } = useBuildCampaignFilters();

  React.useEffect(() => {
    const el = document.querySelector(`[data-id="${data.accountId}"]`);
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsSmall(width <= 896);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [data.accountId]);

  const renderTags = (arr: string[]) => {
    if (!isSmall || arr.length < 1)
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
      data-id={data.accountId}
      className={`promo-grid-row ${isSmall ? "adaptive" : ""}`}
      key={data.accountId}>
      <div className="name">
        <Checkbox isChecked={isInclude} name={data.username} />
      </div>

      <div className="price">
        <img src={data.logoUrl} />
        <span>
          {getPriceByCurrency(data.prices, selectedCurrency)}
          {selectedCurrency.key}
        </span>
      </div>

      <div className="followers">
        <img src={getSocialMediaIcon(data.socialMedia as SocialMediaType)} />
        <span>{formatFollowers(data.followers)}</span>
      </div>

      <div className="genres">
        <div className="tags">{renderTags([...(data?.musicGenres || [])])}</div>
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
