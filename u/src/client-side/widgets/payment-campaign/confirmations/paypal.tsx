import React from "react";
import "./styles/_base-confirmations.scss";
import euro from "@/assets/payments-icons/Vector (10).svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import { toast } from "react-toastify";
import {
  useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

interface Props {
  referenceNumber: string;
}

export const PayPal: React.FC<Props> = ({referenceNumber}) => {
  const { totalPrice } = useCampaignBuilderStore();
  console.log(totalPrice);
  const referenceId = "P935872";
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

        <div className='base-confirmations__header'>
          <h2>Payment confirmation by PayPal</h2>
          <button type={'submit'} className='base-confirmations__button' onClick={() => {}}>
            Confirm payment sent
          </button>
        </div>

        <div className="base-confirmations__content--paypal">
          <div className="base-confirmations__content_paypal">
            <div className="base-confirmations__content_paypal__flex">
              <div className="base-confirmations__count">
                <img src={euro} alt="" />
              </div>
              <p>Total DUE: {totalPrice}€</p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(referenceId, "Reference ID")}
              >
                <img src={copy} alt="Copy reference ID" />
              </button>
              <p>Reference ID: {referenceNumber}</p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <button
                  type="button"
                  className="base-confirmations__count"
                  onClick={() => handleCopy(email, "Email")}
              >
                <img src={copy} alt="Copy email" />
              </button>
              <p>Email: {email}</p>
            </div>

            <div className="base-confirmations__content_paypal__flex">
              <div className="base-confirmations__count">
                <img src={method} alt="" />
              </div>
              <p>Payment method: PayPal</p>
            </div>
          </div>

          <div className="base-confirmations__content__information-paypal">
            <div className="base-confirmations__column-counts">
              <div className="base-confirmations__count white">1</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">2</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">3</div>
            </div>

            <div className="base-confirmations__content__information-paypal__flex">
              <div className="base-confirmations__content__row">
                Please send the funds to: <p className='strong-row-field'>{email}</p>
              </div>
              <div className="base-confirmations__content__row">
                In the "NOTE" section, enter the payment reference number: <p className='strong-row-field'>PP935872</p>
              </div>
              <div className="base-confirmations__content__row">
                If possible, send the payment as "Friends & Family"
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};