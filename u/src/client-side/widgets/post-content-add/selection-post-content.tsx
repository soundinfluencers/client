import React from "react";
import Styles from "./selection.module.scss";

import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";

import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

import { useNavigate } from "react-router-dom";
import { getPriceByCurrency } from "@/client-side/utils";
import { useBuildCampaignFilters } from "@/client-side/store";
interface Props {
  promoCard: IPromoCard[];
  totalPrice: number;
}

export const SelectionAddInfluencer: React.FC<Props> = ({
  promoCard,
  totalPrice,
}) => {
  const { selectedCurrency } = useBuildCampaignFilters();
  const [] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const grouped = React.useMemo(() => {
    const map = new Map<string, IPromoCard[]>();

    for (const card of promoCard) {
      const key = (card.socialMedia ?? "other").toLowerCase();
      map.set(key, [...(map.get(key) ?? []), card]);
    }

    const titleMap: Record<string, string> = {
      tiktok: "TikTok",
      instagram: "Instagram",
      youtube: "YouTube",
      facebook: "Facebook",
      soundcloud: "SoundCloud",
      spotify: "Spotify",
      press: "Press",
    };

    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      title: titleMap[key] ?? key,
      socialMedia: items[0]?.socialMedia,
      items,
    }));
  }, [promoCard]);
  return (
    <div className={Styles.selection}>
      <div className={Styles.selection__head}>
        <h3>Your Selection</h3>
        <button onClick={() => navigate("/client/CreateCampaign")}>
          Edit Selection
        </button>
      </div>
      <div className={Styles.selection__content}>
        <div className={Styles.selection__body}>
          {grouped.map((group) => (
            <div key={group.key} className={Styles.PromoCards}>
              <div className={Styles.PromoCards__header}>
                {/* <div className={Styles.queue}>{offer ? gi + 2 : gi + 1}</div> */}
                <div className={Styles.queue_social}>
                  {" "}
                  <img
                    src={getSocialMediaIcon(
                      group.socialMedia as SocialMediaType,
                    )}
                    alt=""
                  />
                </div>

                <h3>{group.title}</h3>
              </div>

              <div className={Styles.PromoCards__content}>
                {group.items.map((card) => (
                  <div key={card.accountId} className={Styles.title}>
                    <div className={Styles.title__userinfo}>
                      <img src={card.logoUrl} alt="" />
                      <h3>{card.username}</h3>
                    </div>

                    <div className={Styles.followers}>
                      <p>
                        {card.followers > 0 && `${formatFollowers(card.followers)} followers`}
                        <span>
                          {getPriceByCurrency(card.prices, selectedCurrency)}€
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={Styles.selection__footer}>
        <h2>Total price: {totalPrice}€</h2>
      </div>
    </div>
  );
};
