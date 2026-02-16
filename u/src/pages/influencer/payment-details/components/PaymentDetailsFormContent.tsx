import React, { useEffect } from "react";
import { PAYMENT_METHOD_INPUTS_DATA } from "@/pages/influencer/payment-details/data/payment-datails-inputs.data.ts";
import { FormFields } from "@components/form/render-fields/FormFields.tsx";
import {
  getInvoicePaymentMethodLabel,
} from "@/pages/influencer/create-invoice/components/payment-bar/data/payment-method.data.ts";
import { PaymentBar } from "@/pages/influencer/create-invoice/components/payment-bar/PaymentBar.tsx";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { requestDtoMapper } from "@/pages/influencer/payment-details/utils/paymentDetailsRequestDtoMapper.ts";
import { useInfluencerInvoice } from "@/pages/influencer/shared/hooks/useInfluencerInvoice.ts";
import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import {
  PAYMENT_METHOD_FIELDS_MAP
} from "@/pages/influencer/create-invoice/components/invoice-form-content/data/invoice-form-inputs.data.ts";
import { useFormContext } from "react-hook-form";
import type { TPaymentDetailsFormValues } from "@/pages/influencer/payment-details/types/payment-details.types.ts";
import './_payment-details-form-content.scss';

interface Props {
  tab: TInvoicePaymentMethod;
  setTab: (tab: TInvoicePaymentMethod) => void;
}

export const PaymentDetailsFormContent: React.FC<Props> = ({ tab, setTab }) => {
  const {
    savePaymentDetails,
    isSavingPaymentDetails,
  } = useInfluencerInvoice();

  const { setValue, resetField, handleSubmit } = useFormContext<TPaymentDetailsFormValues>();

  useEffect(() => {
    setValue('selectedPaymentMethod', tab, { shouldValidate: true });
  }, [tab, setValue, setTab]);

  const handleTabChange = (newTab: TInvoicePaymentMethod) => {
    if (newTab === tab) return;

    PAYMENT_METHOD_FIELDS_MAP[tab].forEach((fieldName) => {
      resetField(fieldName as keyof TPaymentDetailsFormValues, { keepError: false });
    });

    setTab(newTab);
  };

  return (
    <div className={"payment-details-form-content"}>
      <PaymentBar tab={tab} onChange={handleTabChange} className={"payment-details-form-content__payment"}/>

      <div className={"payment-details-form-content__inputs-block"}>
        <h3 className="payment-details-form-content__title">{getInvoicePaymentMethodLabel(tab)}</h3>
        <FormFields inputs={PAYMENT_METHOD_INPUTS_DATA[tab].inputs}/>
      </div>
      <div className="payment-details-form-content__submit">
        <ButtonMain
          label={isSavingPaymentDetails ? "Saving..." : "Save"}
          type={"submit"}
          onClick={handleSubmit((data) => savePaymentDetails(requestDtoMapper(data)))}
          isDisabled={isSavingPaymentDetails}
        />
      </div>
    </div>
  );
};