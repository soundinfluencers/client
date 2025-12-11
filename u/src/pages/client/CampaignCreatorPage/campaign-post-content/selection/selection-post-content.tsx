import React from "react";
import Styles from "./selection.module.scss";
import { useFormDataOffer } from "../../../../../store/createCampaign";
import { formatFollowers } from "../../../../../utils/functions/formatFollowers";
import { getSocialMediaIcon } from "../../../../../constants/social-medias";
import type { SocialMediaType } from "../../../../../types/utils/constants.types";
import { GenresCountries } from "../../ui/genre-countries/genre-countries";
import chevron from "../../../../../assets/icons/chevron-down.svg";
interface Props {}

export const Selection: React.FC<Props> = () => {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const toggleFlag = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };
  const { offer, promoCard, totalPrice } = useFormDataOffer();
  console.log(offer, "ofere");
  console.log(promoCard, "promoCard");
  return (
    <div className={Styles.selection}>
      <div className={Styles.selection__head}>
        <h3>Your Selection</h3>
        <button>Edit Selection</button>
      </div>
      <div className={Styles.selection__content}>
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
                <li key={acc._id}>
                  <img src={acc.logo} alt="" />
                  {acc.socialMediaUsername}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {promoCard.map((card, i) => {
          const isOpen = openId === card._id;

          return (
            <div key={card._id} className={Styles.PromoCards}>
              <div className={Styles.PromoCards__header}>
                <div className={Styles.queue}>{i + 2}</div>
                <img
                  src={getSocialMediaIcon(card.socialMedia as SocialMediaType)}
                  alt=""
                />
                <h3>{card.socialMedia}</h3>
              </div>

              <div className={Styles.PromoCards__content}>
                <div className={Styles.title}>
                  <img src={card.logo} alt="" />
                  <h3>{card.instagramUsername}</h3>
                </div>

                <div className={Styles.PromoCards__content__info}>
                  <p>
                    {formatFollowers(card.followersNumber)} followers{" "}
                    <span>
                      {card.price} {card.currency}
                    </span>
                  </p>

                  <div
                    onClick={() => toggleFlag(card._id)}
                    className={Styles.genresIcountries}>
                    <p>Genres, Countries</p>
                    <img src={chevron} alt="" />

                    {isOpen && <GenresCountries flag={true} data={card} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={Styles.selection__footer}>
        <h2>Total price: {totalPrice}€</h2>
      </div>
    </div>
  );
};
