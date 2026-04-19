import React from "react";
import euro from "@/assets/payments-icons/Vector (10).svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import beneficiary from "@/assets/payments-icons/rkqZiVo 30.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import link from "@/assets/payments-icons/link.svg";

import type { CurrencyType } from "@/types/client/form-clients/payment-campaign-inputs";
import "./styles/_base-confirmations.scss";
import { useCampaignStore } from "@/client-side/store";
import { toast } from "react-toastify";

interface Props {
  currency?: CurrencyType[];
  referenceNumber: string;
}

export const BankTransfer: React.FC<Props> = ({ currency,referenceNumber }) => {
  const { totalPrice } = useCampaignStore();

  const accountNumber = "17299128";
  const sortCode = "04-00-75";
  const referenceId = "BT935872";

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
      <div className="base-confirmations">
        <h2>Payment confirmation by Bank Transfer UK</h2>

        <div className="base-confirmations__content--banktransfer">
          <div className="base-confirmations__content_banktransfer">
            <div className="base-confirmations__content_banktransfer__flex">
              <div className="base-confirmations__count">
                <img src={euro} alt="Amount" />
              </div>
              <p>Total DUE: {totalPrice}€</p>
            </div>

            <div className="base-confirmations__content_banktransfer__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(accountNumber, "Account Number")}
              >
                <img src={copy} alt="Copy account number" />
              </button>
              <p>Account Number: {accountNumber}</p>
            </div>

            <div className="base-confirmations__content_banktransfer__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(sortCode, "Sort Code")}
              >
                <img src={copy} alt="Copy sort code" />
              </button>
              <p>Sort Code: {sortCode}</p>
            </div>

            <div className="base-confirmations__content_banktransfer__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(referenceId, "Reference ID")}
              >
                <img src={copy} alt="Copy reference ID" />
              </button>
              <p>Reference ID: {referenceNumber}</p>
            </div>
          </div>

          <div className="base-confirmations__content__information-transfer">
            <div className="base-confirmations__content__transfer_flex">
              <div className="base-confirmations__content__transfer_flex__box">
                <div className="base-confirmations__content__row">
                  <div className="base-confirmations__count white">
                    <img src={beneficiary} alt="" />
                  </div>
                  <p>Beneficiary: Techno TV LTD</p>
                </div>
                <p className="base-confirmations__content__row__top">
                  Beneficiary address: 124 City Road, EC1V 2NX, London, United Kingdom
                </p>
              </div>

              <div className="base-confirmations__content__transfer_flex__box">
                <div className="base-confirmations__content__row">
                  <div className="base-confirmations__count white">
                    <img src={method} alt="" />
                  </div>
                  <p>Payment method: Revolut Ltd</p>
                </div>
                <p className="base-confirmations__content__row__top">
                  Bank/Payment method address: 7 Westferry Circus, E14 4HD, London, United Kingdom
                </p>
              </div>

              <div className="base-confirmations__content__transfer_flex__box">
                {currency?.includes("bank_transfer_eu") ? (
                    <div className="base-confirmations__content__row">
                      <p>If possible, send the payment as "Friends & Family"</p>
                    </div>
                ) : (
                    <div className="base-confirmations__content__row">
                      <div className="base-confirmations__count white">
                        <img src={link} alt="" />
                      </div>
                      <p>Add this payment reference number: {referenceId}</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};