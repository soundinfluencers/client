import React from "react";
import plus from "@/assets/icons/plus-square.svg";
import cross from "@/assets/icons/x.svg";
import { usePromoAccountsSearch } from "../../hook/usePromoSearch";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { getSocialMediaIcon } from "@/constants/social-medias";
import styles from "./modal-proposal-add.module.scss";
import { formatFollowers } from "@/utils/functions/formatFollowers";
interface Props {
  socialMedias: SocialMediaType[];
  setModal: () => void;
}

export const ModalProposalAdd: React.FC<Props> = ({
  socialMedias,
  setModal,
}) => {
  const [search, setSearch] = React.useState<string>("");
  const { data: promoCards } = usePromoAccountsSearch({
    socialMedias: socialMedias,
    query: search,
  });
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);
  return (
    <div className={styles.overlay}>
      <div className={styles.overlay__container}>
        <img onClick={setModal} className={styles.cross} src={cross} alt="" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for accounts"
          type="text"
        />
        <div className={styles.overlay__content}>
          {promoCards.map((item) => (
            <div className={styles.card}>
              <div className={styles.card__info}>
                <img
                  src={getSocialMediaIcon(item.socialMedia as SocialMediaType)}
                  alt=""
                />
                <p>{formatFollowers(item.followers || 0)}</p>
              </div>
              <div className={styles.card__logo}>
                <div className={styles.card__logo_content}>
                  <img src={item.logoUrl} alt="" />
                  <p>{item.username}</p>
                </div>
                <img src={plus} alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
