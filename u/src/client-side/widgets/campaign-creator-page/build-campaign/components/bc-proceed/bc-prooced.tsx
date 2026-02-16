import React from "react";
import { ButtonMain } from "@/components";

import { useNavigate } from "react-router-dom";
import "./_bc_prooced.scss";
import { useCampaignStore } from "@/client-side/store";

interface Props {}

export const BcProceed: React.FC<Props> = () => {
  const { totalPrice } = useCampaignStore();
  const navigate = useNavigate();
  return (
    <div className="bc_proceed">
      <p className="bc_proceed__text">
        Total: <span>{totalPrice}€</span>
      </p>
      <ButtonMain
        className={totalPrice <= 0 ? "nonActive" : ""}
        text={"Proceed"}
        onClick={() => {
          if (totalPrice > 0) {
            navigate("/client/create-campaign/content");
          } else null;
        }}
      />
    </div>
  );
};
