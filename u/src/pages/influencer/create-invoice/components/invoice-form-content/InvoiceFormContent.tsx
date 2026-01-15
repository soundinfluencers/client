import './_invoice-form-content.scss'
import { useState } from "react";
import { getInvoicePaymentMethodLabel } from "../../../../../constants/influencer/form-data/invoice/invoice-payment.data";
import { INVOICE_DETAILS_INPUTS_DATA, PAYMENT_METHOD_FIELDS_MAP, PAYMENT_METHOD_INPUTS_DATA } from "../../../../../constants/influencer/form-data/invoice/invoice-tabs-inputs.data";
import type { TInvoicePaymentMethod } from "../../../../../types/influencer/form/invoice/payment-method.types";
import { PaymentBar } from "../payment-bar/PaymentBar";
import { useFormContext } from "react-hook-form";
import { FormFields } from '../../../../../components/form/render-fields/FormFields';

export const InvoiceFormContent = () => {
  const { resetField } = useFormContext();
  const [tab, setTab] = useState<TInvoicePaymentMethod>("UKBankTransfer");

  //{ keepError: false } for clear error on field reset
  const handleTabChange = (newTab: TInvoicePaymentMethod) => {
    if (newTab === tab) return;

    PAYMENT_METHOD_FIELDS_MAP[tab].forEach((fieldName) => {
      resetField(fieldName);
    });

    setTab(newTab);
  };

  return (
    <div className="invoice-form-content">
      <PaymentBar tab={tab} onChange={handleTabChange} />

      <section className='invoice-form-content__inputs-block'>
        <section className='invoice-form-content__inputs'>
          <h3 className='invoice-form-content__title'>Invoice details</h3>
          <FormFields inputs={INVOICE_DETAILS_INPUTS_DATA.inputs} />
        </section>

        <section className='invoice-form-content__inputs'>
          <h3 className='invoice-form-content__title'>{getInvoicePaymentMethodLabel(tab)}</h3>
          <FormFields inputs={PAYMENT_METHOD_INPUTS_DATA[tab].inputs} />
        </section>
      </section>
    </div>
  );
};