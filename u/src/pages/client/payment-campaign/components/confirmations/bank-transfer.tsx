import React from "react";
import euro from "@/assets/payments-icons/Vector (10).svg";
import hashtag from "@/assets/payments-icons/clarity_hashtag-solid.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import link from "@/assets/payments-icons/link.svg";
import beneficiary from "@/assets/payments-icons/rkqZiVo 30.svg";
import num from "@/assets/payments-icons/hugeicons_text-number-sign.svg";
import qr from "@/assets/payments-icons/mage_bar-code-scan.svg";
import type { CurrencyType } from "@/types/client/form-clients/payment-campaign-inputs";
import "./styles/_base-confirmations.scss";

interface Props {
  currency?: CurrencyType[];
}

export const BankTransfer: React.FC<Props> = ({ currency }) => {
  return (
    <div>
      <h2>Payment confirmation by Bank Transfer UK</h2>
      <div className="base-confirmations__content">
        <div className="base-confirmations__content_paypal">
          <div className="base-confirmations__content_paypal__flex">
            <div className="base-confirmations__count">
              <img src={euro} alt="" />
            </div>
            <p>Total DUE: 96€</p>
          </div>
          <div className="base-confirmations__content_paypal__flex">
            <div className="base-confirmations__count">
              <img src={num} alt="" />
            </div>
            <p>IBAN: GB91REVO00997094280983</p>
          </div>
          <div className="base-confirmations__content_paypal__flex">
            <div className="base-confirmations__count">
              <img src={qr} alt="" />
            </div>
            <p>BIC: REVOGB21</p>
          </div>
          <div className="base-confirmations__content_paypal__flex">
            <div className="base-confirmations__count">
              <img src={hashtag} alt="" />
            </div>
            <p>Reference ID: P935872</p>
          </div>
        </div>
        <div className="base-confirmations__content__information-transfer">
          <div className="base-confirmations__content__transfer_flex">
            <div className="base-confirmations__content__transfer_flex__box">
              <div className="base-confirmations__content__row">
                <div className="base-confirmations__count">
                  <img src={beneficiary} alt="" />
                </div>
                <p>Beneficiary: Techno TV LTD</p>
              </div>
              <p className="base-confirmations__content__row__top">
                Beneficiary address: 124 City Road, EC1V 2NX, London, United
                Kingdom
              </p>
            </div>
            <div className="base-confirmations__content__transfer_flex__box">
              <div className="base-confirmations__content__row">
                <div className="base-confirmations__count">
                  <img src={method} alt="" />
                </div>
                <p>Payment method: Revolut Ltd</p>
              </div>
              <p className="base-confirmations__content__row__top">
                Bank/Payment method address: 7 Westferry Circus, E14 4HD,
                London, United Kingdom
              </p>
            </div>
            <div className="base-confirmations__content__transfer_flex__box">
              {currency?.includes("EU") ? (
                <div className="base-confirmations__content__row">
                  <p>If possible, send the payment as "Friends & Family"</p>
                </div>
              ) : (
                <div className="base-confirmations__content__row">
                  <div className="base-confirmations__count">
                    <img src={link} alt="" />
                  </div>
                  <p>Add this payment reference number: 935872</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
