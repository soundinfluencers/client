import React from "react";
import euro from "@/assets/payments-icons/Vector (10).svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import beneficiary from "@/assets/payments-icons/rkqZiVo 30.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import hash from "@/assets/payments-icons/clarity_hashtag-solid.svg";

import type { CurrencyType } from "@/types/client/form-clients/payment-campaign-inputs";
import "./styles/_base-confirmations.scss";
import { toast } from "react-toastify";
import {
  useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
  currency: CurrencyType[];
  referenceNumber: string;
  isSubmitting?: boolean;
}

export const BankTransfer: React.FC<Props> = ({ currency,referenceNumber,isSubmitting }) => {
  const { totalPrice } = useCampaignBuilderStore();
  console.log(totalPrice);
  const currentCurrency = currency[0];
  const accountNumber = "17299128";
  const IBAN = 'GB91REVO00997094280983'
  const BIC = 'REVOGB21'
  const sortCode = "04-00-75";
  const referenceId = "BT935872";
  const BICCINT = 'CHASDEFX'
  const isUk = currentCurrency === "bank_transfer_uk";
  const isEu = currentCurrency === "bank_transfer_eu";
  const isInternational = currentCurrency === "bank_transfer_international";
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

        <div className='base-confirmations__header'>
          <h2>
            {isUk && "Payment confirmation by Bank Transfer UK"}
            {isEu && "Payment confirmation by Bank Transfer EU"}
            {isInternational && "Payment confirmation by Bank Transfer International"}
          </h2>
          <button type={'submit'} className='base-confirmations__button' onClick={() => {}}>
            {isSubmitting ? (
                <CircleLoader/>
            ) : (
                "Confirm payment sent"
            )}
          </button>
        </div>
        <div className="base-confirmations__content--banktransfer">
          {isUk && <div className="base-confirmations__content_banktransfer">
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
          </div>}
          {isEu && <div className="base-confirmations__content_banktransfer">
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
                  onClick={() => handleCopy(IBAN, "IBAN")}
              >
                <img src={copy} alt="Copy account number" />
              </button>
              IBAN
              <p className='strong-row-field'>GB91REVO00997094280983</p>
            </div>
            <div className="base-confirmations__content_banktransfer__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(BIC, "BIC")}
              >
                <img src={copy} alt="Copy account number" />
              </button>
              BIC:
              <p className='strong-row-field'>{BIC}</p>
            </div>

            <div className="base-confirmations__content_banktransfer__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(referenceId, "Reference ID")}
              >
                <img src={copy} alt="Copy reference ID" />
              </button>
              <p className='strong-row-field'>Reference ID: {referenceNumber}</p>
            </div>
          </div>}
          {isInternational &&
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
                      onClick={() => handleCopy(IBAN, "IBAN")}
                  >
                    <img src={copy} alt="Copy account number" />
                  </button>
                  IBAN
                  <p className='strong-row-field'>GB91REVO00997094280983</p>
                </div>
                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(BIC, "BIC")}
                  >
                    <img src={copy} alt="Copy account number" />
                  </button>
                  BIC:
                  <p className='strong-row-field'>{BIC}</p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(referenceId, "Reference ID")}
                  >
                    <img src={copy} alt="Copy reference ID" />
                  </button>
                  <p className='strong-row-field'>Reference ID: {referenceNumber}</p>
                </div>
                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(BICCINT, "CHASDEFX")}
                  >
                    <img src={copy} alt="Copy reference ID" />
                  </button>
                  <p className='strong-row-field'>Intermediary BIC: {BICCINT}</p>
                </div>
              </div>}
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
                  Bank/Payment method address: <span className='strong-row-field'>7 Westferry Circus, E14 4HD, London, United Kingdom</span>
                </p>
              </div>

              {isInternational ?
                  <div className="base-confirmations__content__transfer_flex__box">
                    <div className="base-confirmations__content__row">
                      <div className="base-confirmations__count white">
                        <img src={hash} alt="" />
                      </div>
                      <p>If possible, send the payment as "Friends & Family"</p>
                    </div>
                  </div> :
                  <div className="base-confirmations__content__transfer_flex__box">
                    <div className="base-confirmations__content__row">
                      <div className="base-confirmations__count white">
                        <img src={hash} alt="" />
                      </div>
                      <p>Add this payment reference number: {referenceNumber}</p>
                    </div>
                  </div>}
            </div>
          </div>
        </div>
      </div>
  );
};