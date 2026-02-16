import React from "react";
import "./styles/_base-confirmations.scss";
import euro from "@/assets/payments-icons/Vector (10).svg";
import hashtag from "@/assets/payments-icons/clarity_hashtag-solid.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import { useCampaignStore } from "@/store/client/create-campaign";
interface Props {}

export const PayPal: React.FC<Props> = () => {
  const { totalPrice } = useCampaignStore();
  return (
    <div className="base-confirmations">
      {" "}
      <h2>Payment confirmation by PayPal</h2>
      <div className="base-confirmations__content--paypal">
        <div className="base-confirmations__content_paypal">
          <div className="base-confirmations__content_paypal__flex">
            {" "}
            <div className="base-confirmations__count">
              <img src={euro} alt="" />
            </div>
            <p>Total DUE: {totalPrice}€</p>
          </div>
          <div className="base-confirmations__content_paypal__flex">
            {" "}
            <div className="base-confirmations__count">
              <img src={hashtag} alt="" />
            </div>
            <p>Reference ID: P935872</p>
          </div>{" "}
          <div className="base-confirmations__content_paypal__flex">
            {" "}
            <div className="base-confirmations__count">
              <img src={method} alt="" />
            </div>
            <p>Payment method: PayPal</p>
          </div>
        </div>
        <div className="base-confirmations__content__information-paypal">
          <div className="base-confirmations__column-counts">
            <div className="base-confirmations__count">1</div>
            <div className="base-confirmations__stick"></div>
            <div className="base-confirmations__count">2</div>
            <div className="base-confirmations__stick"></div>
            <div className="base-confirmations__count">3</div>
          </div>
          <div className="base-confirmations__content__information-paypal__flex">
            <div className="base-confirmations__content__row">
              Please send the funds to: technotvchannel@gmail.com
            </div>{" "}
            <div className="base-confirmations__content__row">
              In the "NOTE" section, enter the payment reference number
            </div>{" "}
            <div className="base-confirmations__content__row">
              If possible, send the payment as "Friends & Family"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
