import React from "react";
import "./styles/_base-confirmations.scss";

interface Props {}

export const CryptoPayment: React.FC<Props> = () => {
  return (
    <div>
      {" "}
      <h2>Payment confirmation by Crypto Payment</h2>
      <div className="base-confirmations__content">
        {/* <div className="base-confirmations__column-counts">
          <div className="base-confirmations__count">1</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">2</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">3</div>
          <div className="base-confirmations__stick"></div>
          <div className="base-confirmations__count">4</div>
        </div> */}
        <div className="base-confirmations__content__information"></div>
      </div>
    </div>
  );
};
