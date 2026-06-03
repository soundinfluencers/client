import React from "react";
import euro from "@/assets/payments-icons/Vector (10).svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import beneficiary from "@/assets/payments-icons/rkqZiVo 30.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import hash from "@/assets/payments-icons/clarity_hashtag-solid.svg";

import type { CurrencyType } from "@/types/client/form-clients/payment-campaign-inputs";
import "./styles/_base-confirmations.scss";
import { toast } from "react-toastify";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import { CircleLoader } from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
  currency: CurrencyType[];
  referenceNumber: string;
  isSubmitting?: boolean;
  currencySymbol?: string
  amount?: number;
}

export const BankTransfer: React.FC<Props> = ({
                                                currency,
                                                referenceNumber,
                                                isSubmitting,
                                                currencySymbol,
                                                amount
                                              }) => {
  const { totalPrice } = useCampaignBuilderStore();
  const displayAmount = Number(amount ?? totalPrice ?? 0);
  const currentCurrency = currency[0];

  const accountNumber = "17299128";
  const iban = "GB91REVO00997094280983";
  const bic = "REVOGB21";
  const sortCode = "04-00-75";
  const intermediaryBic = "CHASDEFX";

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
        <div className="base-confirmations__header">
          <h2>
            {isUk && "Payment confirmation by Bank Transfer UK"}
            {isEu && "Payment confirmation by Bank Transfer EU"}
            {isInternational &&
                "Payment confirmation by Bank Transfer International"}
          </h2>

          <button
              type="submit"
              className="base-confirmations__button"
              disabled={isSubmitting}
          >
            {isSubmitting ? <CircleLoader /> : "Confirm payment sent"}
          </button>
        </div>

        <div className="base-confirmations__content--banktransfer">
          {isUk && (
              <div className="base-confirmations__content_banktransfer">
                <div className="base-confirmations__content_banktransfer__flex">
                  <div className="base-confirmations__count">
                    <img src={euro} alt="Amount" />
                  </div>
                  <p>Total DUE: {displayAmount}{currencySymbol ?? "€"}</p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(accountNumber, "Account Number")}
                  >
                    <img src={copy} alt="Copy account number" />
                  </button>
                  <p>
                    Account Number:{" "}
                    <span className="strong-row-field">{accountNumber}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(sortCode, "Sort Code")}
                  >
                    <img src={copy} alt="Copy sort code" />
                  </button>
                  <p>
                    Sort Code: <span className="strong-row-field">{sortCode}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(referenceNumber, "Reference ID")}
                  >
                    <img src={copy} alt="Copy reference ID" />
                  </button>
                  <p>
                    Reference ID:{" "}
                    <span className="strong-row-field">{referenceNumber}</span>
                  </p>
                </div>
              </div>
          )}

          {isEu && (
              <div className="base-confirmations__content_banktransfer">
                <div className="base-confirmations__content_banktransfer__flex">
                  <div className="base-confirmations__count">
                    <img src={euro} alt="Amount" />
                  </div>
                  <p>Total DUE: {displayAmount}{currencySymbol ?? "€"}</p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(iban, "IBAN")}
                  >
                    <img src={copy} alt="Copy IBAN" />
                  </button>
                  <p>
                    IBAN: <span className="strong-row-field">{iban}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(bic, "BIC")}
                  >
                    <img src={copy} alt="Copy BIC" />
                  </button>
                  <p>
                    BIC: <span className="strong-row-field">{bic}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(referenceNumber, "Reference ID")}
                  >
                    <img src={copy} alt="Copy reference ID" />
                  </button>
                  <p>
                    Reference ID:{" "}
                    <span className="strong-row-field">{referenceNumber}</span>
                  </p>
                </div>
              </div>
          )}

          {isInternational && (
              <div className="base-confirmations__content_banktransfer">
                <div className="base-confirmations__content_banktransfer__flex">
                  <div className="base-confirmations__count">
                    <img src={euro} alt="Amount" />
                  </div>
                  <p>Total DUE: {displayAmount}{currencySymbol ?? "€"}</p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(iban, "IBAN")}
                  >
                    <img src={copy} alt="Copy IBAN" />
                  </button>
                  <p>
                    IBAN: <span className="strong-row-field">{iban}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(bic, "BIC")}
                  >
                    <img src={copy} alt="Copy BIC" />
                  </button>
                  <p>
                    BIC: <span className="strong-row-field">{bic}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(referenceNumber, "Reference ID")}
                  >
                    <img src={copy} alt="Copy reference ID" />
                  </button>
                  <p>
                    Reference ID:{" "}
                    <span className="strong-row-field">{referenceNumber}</span>
                  </p>
                </div>

                <div className="base-confirmations__content_banktransfer__flex">
                  <button
                      type="button"
                      className="base-confirmations__count"
                      onClick={() => handleCopy(intermediaryBic, "Intermediary BIC")}
                  >
                    <img src={copy} alt="Copy intermediary BIC" />
                  </button>
                  <p>
                    Intermediary BIC:{" "}
                    <span className="strong-row-field">{intermediaryBic}</span>
                  </p>
                </div>
              </div>
          )}

          <div className="base-confirmations__info-cards">
            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={beneficiary} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                Beneficiary: <span className="strong-row-field">Techno TV LTD</span>
                <br />
                Beneficiary address: 124 City Road, EC1V 2NX, London, United
                Kingdom
              </div>
            </div>

            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={method} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                Payment method: <span className="strong-row-field">Revolut Ltd</span>
                <br />
                Bank/Payment method address:{" "}
                <span className="strong-row-field">
                7 Westferry Circus, E14 4HD, London, United Kingdom
              </span>
              </div>
            </div>

            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={hash} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                {isInternational ? (
                    <>If possible, send the payment as "Friends &amp; Family"</>
                ) : (
                    <>
                      Add this payment reference number:{" "}
                      <span className="strong-row-field">{referenceNumber}</span>
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};