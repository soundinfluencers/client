import "./styles/_base-confirmations.scss";
import { toast } from "react-toastify";
import euro from "@/assets/payments-icons/Vector (10).svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import React from "react";
import {
  useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
    referenceNumber: string;
    isSubmitting?: boolean;
    currencySymbol?: string;
    amount?: number;
}


export const BankCard: React.FC<Props> = ({referenceNumber,isSubmitting,currencySymbol,amount}) => {
  const { totalPrice } = useCampaignBuilderStore();
    const displayAmount = Number(amount ?? totalPrice ?? 0);
  const referenceId = "P935872";
  console.log(totalPrice);
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
          <h2>Payment confirmation by Bank Card</h2>
          <button
              type="submit"
              className="base-confirmations__button"
              disabled={isSubmitting}
          >
            {isSubmitting ? (
                <CircleLoader/>
            ) : (
                "Confirm payment sent"
            )}
          </button>
        </div>

        <div className="base-confirmations__content--bankcard">
          <div className="base-confirmations__content_bankcard">
            <div className="base-confirmations__content_bankcard__flex">
              <div className="base-confirmations__count">
                <img src={euro} alt="" />
              </div>
                <p>Total DUE: {displayAmount}{currencySymbol ?? "€"}</p>
            </div>

            <div className="base-confirmations__content_bankcard__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(referenceId, "Reference ID")}
              >
                <img src={copy} alt="Copy reference ID" />
              </button>
              <p>Reference ID: {referenceNumber}</p>
            </div>

            <div className="base-confirmations__content_bankcard__flex">
              <div className="base-confirmations__count">
                <img src={method} alt="" />
              </div>
              <p>Payment method: Bank Card</p>
            </div>
          </div>

          <div className="base-confirmations__steps">
            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">1</div>
              <div className="base-confirmations__step-text">
                Go On:{" "}
                <span className="strong-row-field">
        https://revolut.me/technotvltd
      </span>
              </div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">2</div>
              <div className="base-confirmations__step-text">
                Select the currency “EURO” and enter the amount due, showing here on top
              </div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">3</div>
              <div className="base-confirmations__step-text">
                In the "NOTE" section, enter the payment reference number:{" "}
                <span className="strong-row-field">*C935872</span>
              </div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">4</div>
              <div className="base-confirmations__step-text">Click “Pay”</div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">5</div>
              <div className="base-confirmations__step-text">
                Select payment by card and enter card details
              </div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">6</div>
              <div className="base-confirmations__step-text">Click “Pay”</div>
            </div>

            <div className="base-confirmations__step">
              <div className="base-confirmations__step-number">7</div>
              <div className="base-confirmations__step-text">
                Add this payment reference number:{" "}
                <span className="strong-row-field">*C935872</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};