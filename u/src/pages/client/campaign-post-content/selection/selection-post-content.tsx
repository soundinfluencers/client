import React from "react";
import Styles from "./selection.module.scss";

import chevron from "@/assets/icons/chevron-down.svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { GenresCountries } from "../../campaign-creator-page/ui/genre-countries/genre-countries";
import type {
  IApiOffer,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";
import { getPriceByCurrency } from "../../campaign-creator-page/build-campaign/components/bc-cards/bc-card/utils/use-price-currency";
import { useBuildCampaignFilters } from "@/store/client/createCampaign/useBuildCampaignFilters";
import { useNavigate } from "react-router-dom";
interface Props {
  offer: IApiOffer | null;
  promoCard: IPromoCard[];
  totalPrice: number;
}

export const Selection: React.FC<Props> = ({
  offer,
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
          {offer && (
            <div className={Styles.offer}>
              {" "}
              <div className={Styles.offer__header}>
                <div className={Styles.queue}>1</div>
                <h3>{offer?.title}</h3>
                <p>{offer?.price}</p>
              </div>
              <div className={Styles.offer__content}>
                <ul>
                  {offer?.connectedAccounts.map((acc) => (
                    <li key={acc.accountId}>
                      <img src={acc.logoUrl} alt="" />
                      {acc.username}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {promoCard.map((card, i) => {
            const isOpen = openId === card.accountId;

            return (
              <div key={card.accountId} className={Styles.PromoCards}>
                <div className={Styles.PromoCards__header}>
                  <div className={Styles.queue}>{offer ? i + 2 : i + 1}</div>
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
                    <img src={card.logoUrl} alt="" />
                    <h3>{card.username}</h3>
                  </div>

                  <div className={Styles.PromoCards__content__info}>
                    <p>
                      {formatFollowers(card.followers)} followers{" "}
                      <span>
                        {getPriceByCurrency(card.prices, selectedCurrency)}
                      </span>
                    </p>

                    {card.countries.length > 0 &&
                      card.musicGenres.length > 0 && (
                        <div
                          onClick={() => toggleFlag(card.accountId)}
                          className={Styles.genresIcountries}>
                          <p>Genres, Countries</p>
                          <img src={chevron} alt="" />

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
