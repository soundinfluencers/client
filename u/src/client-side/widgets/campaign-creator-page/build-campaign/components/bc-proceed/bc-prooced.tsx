
import { ButtonMain } from "@/components";

import { useNavigate } from "react-router-dom";
import "./_bc_prooced.scss";
import { useCampaignStore } from "@/client-side/store";


export const BcProceed = () => {
    const { offer, totalPrice, promoCardUI } = useCampaignStore();
    const navigate = useNavigate();

    const canProceed = offer?._id || promoCardUI.length >= 1;
  return (
    <div className="bc_proceed">
      <p className="bc_proceed__text">
        Total: <span>{totalPrice}€</span>
      </p>
      <ButtonMain
        className={totalPrice <= 0 ? "nonActive" : ""}
        text={"Proceed"}
        onClick={() =>
            canProceed && navigate("/client/create-campaign/content")
        }
      />
    </div>
  );
};
