import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import "./_table_row_card.scss";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";
import { Checkbox } from "@/components";
import { getPriceByCurrency } from "@/client-side/utils";

import { TagsDropdown } from "./tags-dropdown";
import { useBuildCampaignFilters, useCampaignStore } from "@/client-side/store";

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
  const { actions } = useCampaignStore();
  const [checked, setChecked] = React.useState(false);

  const addPromo = (checked: boolean) => {
    setChecked(checked);
    if (isInclude) return;
    actions.setPromoCards(data);
    actions.setPromoCardsUI(data);
  };

  React.useEffect(() => {
    const el = document.querySelector(`[data-id="${data.accountId}"]`);
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsSmall(width <= 896);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [data.accountId, setIsSmall]);

  const genres = [...(data?.musicGenres || [])];
  const countries =
    data?.countries?.map((c) => `${c.country} ${c.percentage}%`) ?? [];

  return (
    <div
      data-id={data.accountId}
      className={`promo-grid-row ${isSmall ? "adaptive" : ""}`}
      key={data.accountId}>
      <div className="name">
        <Checkbox
          onChange={addPromo}
          isChecked={isInclude || checked}
          name={data.username}
        />
      </div>

      <div className="price">
        <img src={data.logoUrl} alt="" />
        <span>
          {getPriceByCurrency(data.prices, selectedCurrency)}
          {selectedCurrency.key}
        </span>
      </div>

      <div className="followers">
        <img
          src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
          alt=""
        />
        <span>{formatFollowers(data.followers)}</span>
      </div>

      <div className="genres">
        <TagsDropdown items={genres} placeholder="No genres" />
      </div>

      <div className="countries">
        <TagsDropdown items={countries} placeholder="No countries" />
      </div>
    </div>
  );
};
