import React from "react";
import { useNavigate } from "react-router-dom";
import plus from "@/assets/icons/plus.svg";
import "./_footer.scss";
import { useCampaignStore } from "@/client-side/store";
interface Props {}

export const Footer: React.FC<Props> = () => {
  const { offer, totalPrice, promoCard } = useCampaignStore();
  const navigate = useNavigate();

  const canProceed = offer?._id || promoCard.length >= 1;

  return (
    <div className="footer-campaign-creator-page">
      <div className="footer-campaign-creator-page__content">
        <p>{offer?._id ? offer.title : "No offer selected"}</p>
        <img src={plus} alt="" />
        <p>
          {promoCard.length > 0 ? `${promoCard.length} networks` : "0 networks"}
        </p>
        <p>Total: {totalPrice}€</p>
      </div>
      <button
        className={canProceed ? "active" : ""}
        disabled={!canProceed}
        onClick={() =>
          canProceed && navigate("/client/create-campaign/content")
        }>
        Proceed
      </button>
    </div>
  );
};
