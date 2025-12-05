import React from "react";
import { useNavigate } from "react-router-dom";
import "./_proceed.scss";
import { useFormDataOffer } from "../../store/createCampaign";
interface Props {}

export const Proceed: React.FC<Props> = () => {
  const { offer } = useFormDataOffer();
  const navigate = useNavigate();
  return (
    <div className="proceed">
      <div className="proceed__content">
        <div className="proceed__content__offers">
          {offer?._id ? (
            <p>
              Offer: <span>1</span>
            </p>
          ) : (
            <p>
              Offer: <span>0</span>
            </p>
          )}
        </div>{" "}
        <div className="proceed__content__offers">
          <p>
            Networks: <span>0</span>
          </p>
        </div>
      </div>
      <div className="total">
        <p>
          Offer: {offer?._id ? <span>{offer.price}€</span> : <span>0€</span>}
        </p>
      </div>
      {offer?._id ? (
        <button
          className="active"
          onClick={() => navigate("/client/CreateCampaign/Content")}>
          proceed
        </button>
      ) : (
        <button>proceed</button>
      )}
    </div>
  );
};
