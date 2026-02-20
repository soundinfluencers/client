import React from "react";
import { useNavigate } from "react-router-dom";
import plus from "@/assets/icons/plus.svg";
import "./_footer.scss";
import { useCampaignStore } from "@/client-side/store";
interface Props {}

export const Footer: React.FC<Props> = () => {
  const { offer, totalPrice, promoCardUI } = useCampaignStore();
  const navigate = useNavigate();
  console.log(promoCardUI, "ui");
  const canProceed = offer?._id || promoCardUI.length >= 1;

  return (
    <div className="footer-campaign-creator-page">
      <div className="footer-campaign-creator-page__content">
        <p>
          Offer: <span className="count">{offer?._id ? 1 : 0}</span>
        </p>
        <img src={plus} alt="" />
        <p>
          Networks:
          <span className="count">
            {promoCardUI.length > 0 ? promoCardUI.length : 0}
          </span>
        </p>
        <p>
          Total: <span className="count">{totalPrice}€</span>
        </p>
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
