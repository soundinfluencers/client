import React from "react";
import "./styles/_base-confirmations.scss";
interface Props {}

export const BankCard: React.FC<Props> = () => {
  return (
    <div className="base-confirmations">
      <h2>Payment confirmation by Bank Card</h2>
      <div className="base-confirmations__content">
        <div className="base-confirmations__column-counts">
          <div className="base-confirmations__count">1</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">2</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">3</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">4</div>{" "}
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">5</div>{" "}
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">6</div>{" "}
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">7</div>
        </div>
        <div className="base-confirmations__content__information">
          <div className="base-confirmations__content__row">
            Go On:
            <p className="base-confirmations__content__border">
              https://revolut.me/technotvltd
            </p>
          </div>{" "}
          <div className="base-confirmations__content__row">
            Select the currency “EURO” and enter the amount due, showing here on
            top
          </div>
          <div className="base-confirmations__content__row">
            In the "NOTE" section, enter the payment reference number:{" "}
            <p className="base-confirmations__content__border">*C935872</p>
          </div>{" "}
          <p className="base-confirmations__content__border">Click “Pay”</p>{" "}
          <div className="base-confirmations__content__row">
            Select payment by card and enter card details
          </div>{" "}
          <p className="base-confirmations__content__border">Click “Pay”</p>{" "}
          <div className="base-confirmations__content__row">
            Add this payment reference number:
            <p className="base-confirmations__content__border">*C935872</p>
          </div>{" "}
        </div>
      </div>
    </div>
  );
};
