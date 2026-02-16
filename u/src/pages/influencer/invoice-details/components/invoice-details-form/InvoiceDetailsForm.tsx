import './_invoice-details-form.scss';
import { Form } from "@/components";
import React, { useMemo } from "react";
import type {
  TInvoiceDetailsApi,
  TInvoiceDetailsFormValues, TUpdateInvoiceDetailsDto,
} from "@/pages/influencer/invoice-details/types/invoice-details.types.ts";
import { FormFields } from "@components/form/render-fields/FormFields.tsx";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { cleanPayload } from "@/pages/influencer/invoice-details/utils/cleanPayloadForApi.ts";
import {
  INVOICE_DETAILS_INPUTS_DRAFT_DATA,
} from "@/pages/influencer/invoice-details/data/invoice-details-list.data.ts";
import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";
import { getDefaultInvoiceDetailsValues } from "@/pages/influencer/invoice-details/utils/getDefaultFormValues.ts";

interface Props {
  onClose: () => void;
  invoiceDetails: TInvoiceDetailsApi;
  isSaving: boolean;
  onSave: (data: TUpdateInvoiceDetailsDto) => void;
}

export const InvoiceDetailsForm: React.FC<Props> = ({ invoiceDetails, onSave, isSaving, onClose }) => {
  const defaultValues = useMemo(
    () => getDefaultInvoiceDetailsValues(invoiceDetails),
    [invoiceDetails],
  );

  const handleSubmit = (data: TInvoiceDetailsFormValues) => {
    const payload = cleanPayload<TUpdateInvoiceDetailsDto>(data);
    console.log('Payload after cleaning:', payload);

    // compare payload with invoiceDetails, if they are the same, just close the form
    if (!payload || Object.keys(payload).length === 0 || compareObjects(data, defaultValues)) {
      onClose();
      return;
    }

    onSave(payload);
  };

  return (
    <Form
      className={'invoice-details-form'}
      defaultValues={defaultValues}
      schema={undefined}
      onSubmit={handleSubmit}
    >
      <FormFields inputs={INVOICE_DETAILS_INPUTS_DRAFT_DATA.inputs}/>

      <div className={"invoice-details-form__actions"}>
        <ButtonMain
          className={'invoice-details-form__submit'}
          label={isSaving ? <SmallLoader/> : 'Save'}
          isDisabled={isSaving}
          type={'submit'}
        />
      </div>
    </Form>
  );
};

const compareObjects = (obj1: TInvoiceDetailsFormValues, obj2: TInvoiceDetailsFormValues): boolean => {
  return obj1.firstName === obj2.firstName &&
    obj1.lastName === obj2.lastName &&
    obj1.address === obj2.address &&
    obj1.country === obj2.country &&
    obj1.company === obj2.company &&
    obj1.vatNumber === obj2.vatNumber;
};