import React from "react";
import Styles from "./selection.module.scss";
import { useNavigate } from "react-router-dom";
import offerIcon from "@/assets/icons/Multi platforms.svg"
import { getSocialMediaIconPostContent} from "@/constants/social-medias";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { getPriceByCurrency } from "@/client-side/utils";
import { useBuildCampaignFilters } from "@/client-side/store";

import type { Offer, ConnectedAccount } from "@/client-side/types/offers";
import {
  groupPromoCardsBySocialMedia
} from "@/client-side/pages/campaign-post-content/model/campaign-post-content.helpers.ts";


interface Props {
  offer: Offer | null;
  promoCard: ConnectedAccount[];
  totalPrice: number;
}

export const Selection: React.FC<Props> = ({
                                             offer,
                                             promoCard,
                                             totalPrice,
                                           }) => {
  const { selectedCurrency } = useBuildCampaignFilters();
  const navigate = useNavigate();

  const grouped = React.useMemo(
      () => groupPromoCardsBySocialMedia(promoCard),
      [promoCard],
  );

  return (
      <div className={Styles.selection}>
        <div className={Styles.selection__head}>
          <h3>Your Selection</h3>
          <button onClick={() => navigate("/client/create-campaign")}>
            Edit Selection
          </button>
        </div>

        <div className={Styles.selection__content}>
          <div className={Styles.selection__body}>
            {offer && (
                <div className={Styles.offer}>
                  <div className={Styles.offer__header}>

                    <div className={Styles.offer__header__info}>
                        <div className={Styles.queue_social}>
                            <img
                                src={offerIcon}
                                alt=""
                            />
                        </div>
                        <h3>{offer.title}</h3>
                        <p>{offer.price}€</p>
                    </div>
                  </div>

                  <div className={Styles.offer__content}>
                    <ul>
                      {offer.connectedAccounts.map((account) => (
                          <li key={account.accountId}>
                            <div className={Styles.info}>
                              <img src={account.logoUrl} alt="" />
                              {account.username}
                            </div>
                            <span>{formatFollowers(account.followers)}</span>
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
            )}

            {grouped.map((group) => (
                <div key={group.key} className={Styles.PromoCards}>
                  <div className={Styles.PromoCards__header}>
                    <div className={Styles.queue_social}>
                      <img
                          src={getSocialMediaIconPostContent(group.socialMedia)}
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