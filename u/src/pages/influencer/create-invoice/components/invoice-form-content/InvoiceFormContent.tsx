import './_invoice-form-content.scss'
import { PaymentBar } from "../payment-bar/PaymentBar";
import { FormFields } from '@components/form/render-fields/FormFields.tsx';
import {
  INVOICE_DETAILS_INPUTS_DATA, PAYMENT_METHOD_FIELDS_MAP,
  PAYMENT_METHOD_INPUTS_DATA,
} from './data/invoice-form-inputs.data.ts';
import { getInvoicePaymentMethodLabel } from '../payment-bar/data/payment-method.data';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import { Modal } from '@/components/ui/modal-fix/Modal';
import { useNavigate } from 'react-router-dom';
import { requestDtoMapper } from './utils/invoice-form.mapper';
import { AmountInput } from "@/pages/influencer/create-invoice/components/amount-input/AmountInput.tsx";
import { useInfluencerInvoice } from "@/pages/influencer/shared/hooks/useInfluencerInvoice.ts";
import { useFormContext } from "react-hook-form";
import type {
  InvoiceFormValues
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";
import React, { useEffect } from "react";
import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import type {
  InvoicePayload
} from "@/pages/influencer/create-invoice/components/invoice-form-content/validation/schema.ts";

interface Props {
  tab: TInvoicePaymentMethod;
  setTab: (newTab: TInvoicePaymentMethod) => void;
}

export const InvoiceFormContent: React.FC<Props> = ({ tab, setTab }) => {
  const navigate = useNavigate();
  // saveInvoice(requestDtoMapper(data))
  const {
    isModalOpen,
    setIsModalOpen,
    saveInvoice,
    isSavingInvoice,
  } = useInfluencerInvoice();

  const { resetField, handleSubmit, setValue } = useFormContext<InvoicePayload>();

  useEffect(() => {
    setValue('selectedPaymentMethod', tab, { shouldValidate: true });
  }, [tab, setTab, setValue]);

  const handleCreateInvoiceTabChange = (newTab: TInvoicePaymentMethod) => {
    if (newTab === tab) return;

    PAYMENT_METHOD_FIELDS_MAP[tab].forEach((fieldName) => {
      resetField(fieldName as keyof InvoiceFormValues, { keepError: false });
    });

    setTab(newTab);
  };

  // console.log('Form submitted with data:', requestDtoMapper(data))

  return (
    <div className="invoice-form-content">
      <div className="invoice-form-content__wrapper">
        <PaymentBar tab={tab} onChange={handleCreateInvoiceTabChange} className={'invoice-form-content__payments'}/>

        <div className="invoice-form-content__inputs-block">
          <div className="invoice-form-content__inputs">
            <h3 className="invoice-form-content__title">Invoice details</h3>
            <FormFields inputs={INVOICE_DETAILS_INPUTS_DATA.inputs}/>
          </div>

          <div className="invoice-form-content__inputs">
            <h3 className="invoice-form-content__title">{getInvoicePaymentMethodLabel(tab)}</h3>
            <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
              <FormFields inputs={PAYMENT_METHOD_INPUTS_DATA[tab].inputs}/>
              <AmountInput/>
            </div>
          </div>
        </div>

        <div className="invoice-form-content__submit-button">
          <ButtonMain
            label={isSavingInvoice ? "Submitting..." : "Submit Invoice"}
            type="submit"
            onClick={handleSubmit((data) => saveInvoice(requestDtoMapper(data)))}
            isDisabled={isSavingInvoice}
          />
        </div>
      </div>



      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
        >
          <div className="invoice-form-content__modal">
            <div className="invoice-form-content__modal-header">
              <h2 className="invoice-form-content__modal-header-title">Invoice submitted successfully</h2>
              <div className="invoice-form-content__modal-header-description-block">
                <p className="invoice-form-content__modal-header-description">
                  Thank you for your submission. Our usual payment processing time is <strong>1–7 business days</strong>.
                  <br/>
                  <br/>
                  You’ll be notified once the payment is completed or if there’s any issue with your payment details.
                  <br/>
                  <br/>
                  We appreciate your collaboration and look forward to working together on upcoming campaigns.
                </p>
              </div>
            </div>
            <div className="invoice-form-content__modal-actions-block">
              <h3 className="invoice-form-content__modal-actions-title">Continue to:</h3>
              <div className="invoice-form-content__modal-actions">
                <ButtonMain
                  label="Home Page"
                  onClick={() => {
                    navigate('/');
                    setIsModalOpen(false);
                  }}
                />
                <ButtonMain
                  label="My Invoices"
                  onClick={() => {
                    navigate('/influencer/invoices-history');
                    setIsModalOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};