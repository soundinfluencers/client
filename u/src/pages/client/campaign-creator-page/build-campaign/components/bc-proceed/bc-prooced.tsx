import React from "react";
import { ButtonMain } from "@/components";
import { useCampaignStore } from "@/store/client/createCampaign";
import { useNavigate } from "react-router-dom";
import "../../scss-module/_bc_prooced.scss";

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
            navigate("/client/CreateCampaign/Content");
          } else null;
        }}
      />
    </div>
  );
};
