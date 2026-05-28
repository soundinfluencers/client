import React from "react";
import "./styles/_base-confirmations.scss";
import euro from "@/assets/payments-icons/Vector (10).svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import hash from "@/assets/payments-icons/clarity_hashtag-solid.svg";
import { toast } from "react-toastify";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import { CircleLoader } from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
  referenceNumber: string;
  isSubmitting?: boolean;
  currencySymbol?: string
}

export const PayPal: React.FC<Props> = ({ referenceNumber, isSubmitting,currencySymbol }) => {
  const { totalPrice } = useCampaignBuilderStore();

  const email = "technotvchannel@gmail.com";

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
          <h2>Payment confirmation by PayPal</h2>

          <button
              type="submit"
              className="base-confirmations__button"
              disabled={isSubmitting}
          >
            {isSubmitting ? <CircleLoader /> : "Confirm payment sent"}
          </button>
        </div>

        <div className="base-confirmations__content--paypal">
          <div className="base-confirmations__content_paypal">
            <div className="base-confirmations__content_paypal__flex">
              <div className="base-confirmations__count">
                <img src={euro} alt="" />
              </div>
              <p>Total DUE: {totalPrice}{currencySymbol ?? "€"}</p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(referenceNumber, "Reference ID")}
              >
                <img src={copy} alt="Copy reference ID" />
              </button>
              <p>Reference ID:  <span className="strong-row-field">{referenceNumber}</span> </p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(email, "Email")}
              >
                <img src={copy} alt="Copy email" />
              </button>
              <p>Email: <span className="strong-row-field">{email}</span> </p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <div className="base-confirmations__count">
                <img src={method} alt="" />
              </div>
              <p>Payment method: PayPal</p>
            </div>
          </div>

          <div className="base-confirmations__info-cards">
            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={method} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                Please send the funds to:{" "}
                <span className="strong-row-field">{email}</span>
              </div>
            </div>

            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={copy} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                In the "NOTE" section, enter the payment reference number:{" "}
                <span className="strong-row-field">{referenceNumber}</span>
              </div>
            </div>

            <div className="base-confirmations__info-card">
              <div className="base-confirmations__info-icon">
                <img src={hash} alt="" />
              </div>

              <div className="base-confirmations__info-text">
                If possible, send the payment as "Friends &amp; Family"
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};