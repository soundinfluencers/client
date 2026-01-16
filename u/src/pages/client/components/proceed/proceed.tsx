import React from "react";
import { useNavigate } from "react-router-dom";
import "./_proceed.scss";
import { useCampaignStore } from "@/store/client/createCampaign";

export const Proceed: React.FC = () => {
  const { offer, totalPrice, promoCard } = useCampaignStore();
  const navigate = useNavigate();

  const canProceed = offer?._id || promoCard.length >= 1;

  return (
    <div className="proceed">
      <div className="proceed__content">
        <div className="proceed__content__offers">
          <p>
            Offer: <span>{offer?._id ? 1 : 0}</span>
          </p>
        </div>
        <div className="proceed__content__offers">
          <p>
            Networks: <span>{promoCard.length}</span>
          </p>
        </div>
      </div>

      <div className="total">
        <p>
          Total: <span>{canProceed ? `${totalPrice}€` : "0€"}</span>
        </p>
      </div>

      <button
        className={canProceed ? "active" : ""}
        disabled={!canProceed}
        onClick={() =>
          canProceed && navigate("/client/CreateCampaign/Content")
        }>
        Proceed
      </button>
    </div>
  );
};
