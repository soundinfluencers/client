import "./styles/_base-confirmations.scss";
import { toast } from "react-toastify";
import euro from "@/assets/payments-icons/Vector (10).svg";
import copy from "@/assets/icons/akar-icons_copy.svg";
import method from "@/assets/payments-icons/mdi_recurring-payment.svg";
import React from "react";
import {
  useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

interface Props {
  referenceNumber: string;
}


export const BankCard: React.FC<Props> = ({referenceNumber}) => {
  const { totalPrice } = useCampaignBuilderStore();
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
          <button type={'submit'} className='base-confirmations__button' onClick={() => {}}>
            Confirm payment sent
          </button>
        </div>

        <div className="base-confirmations__content--bankcard">
          <div className="base-confirmations__content_bankcard">
            <div className="base-confirmations__content_bankcard__flex">
              <div className="base-confirmations__count">
                <img src={euro} alt="" />
              </div>
              <p>Total DUE: {totalPrice}€</p>
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

          <div className="base-confirmations__content__information-bankcard">
            <div className="base-confirmations__column-counts">
              <div className="base-confirmations__count white">1</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">2</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">3</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">4</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">5</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">6</div>
              <div className="base-confirmations__stick"></div>
              <div className="base-confirmations__count white">7</div>
            </div>

            <div className="base-confirmations__content__information">
              <div className="base-confirmations__content__row">
                Go On:
               <p className='strong-row-field'>https://revolut.me/technotvltd</p>
              </div>

              <div className="base-confirmations__content__row">
                Select the currency “EURO” and enter the amount due, showing here
                on top
              </div>

              <div className="base-confirmations__content__row">
                In the "NOTE" section, enter the payment reference number:
               <p className='strong-row-field'>*C935872</p>
              </div>

             <p>Click “Pay”</p>

              <div className="base-confirmations__content__row">
                Select payment by card and enter card details
              </div>

              <p>Click “Pay”</p>

              <div className="base-confirmations__content__row">
                Add this payment reference number:
                <p className='strong-row-field'>*C935872</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};