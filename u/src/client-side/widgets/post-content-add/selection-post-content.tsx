import React from "react";
import Styles from "./selection.module.scss";

import chevron from "@/assets/icons/chevron-down.svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";

import type {
  IApiOffer,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";

import { useNavigate } from "react-router-dom";
import { getPriceByCurrency } from "@/client-side/utils";
import { GenresCountries } from "@/shared/ui";
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
  const [openId, setOpenId] = React.useState<string | null>(null);
  const toggleFlag = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };
  const navigate = useNavigate();

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
          {promoCard.map((card, i) => {
            const isOpen = openId === card.accountId;

            return (
              <div key={card.accountId} className={Styles.PromoCards}>
                <div className={Styles.PromoCards__header}>
                  <div className={Styles.queue}>{i + 1}</div>
                  <img
                    src={getSocialMediaIcon(
                      card.socialMedia as SocialMediaType,
                    )}
                    alt=""
                  />
                  <h3>{card.socialMedia}</h3>
                </div>

                <div className={Styles.PromoCards__content}>
                  <div className={Styles.title}>
                    <div className={Styles.title__userinfo}>
                      <img src={card.logoUrl} alt="" />
                      <h3>{card.username}</h3>
                    </div>
                    <div className={Styles.followers}>
                      <p>
                        {formatFollowers(card.followers)} followers{" "}
                        <span>
                          {getPriceByCurrency(card.prices, selectedCurrency)}€
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={Styles.PromoCards__content__info}>
                    {card.countries.length > 0 &&
                      card.musicGenres.length > 0 && (
                        <div
                          onClick={() => toggleFlag(card.accountId)}
                          className={Styles.genresIcountries}
                          data-open={isOpen}>
                          <p>Genres, Countries</p>
                          <img
                            className={isOpen ? "rotated" : ""}
                            src={chevron}
                            alt=""
                          />

                          {isOpen && (
                            <GenresCountries
                              flag={true}
                              data={card}
                              isInclude={false}
                            />
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={Styles.selection__footer}>
        <h2>Total price: {totalPrice}€</h2>
      </div>
    </div>
  );
};
