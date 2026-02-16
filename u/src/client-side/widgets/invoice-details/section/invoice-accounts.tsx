import React from "react";
import { Edit } from "@/components/ui/edit/edit";
import { Form } from "@/components";

import { invoiceFields } from "@/client-side/constants/account-settings-data";

import { SubmitButton } from "@/components/ui/submit-button/submit-button";
import { FillData } from "../fill-data/fill-data";
import { useUpdateInvoiceMutation } from "@/client-side/react-query";
import { InvoiceSettingsForm } from "@/client-side/client-forms";

interface Props {
  invoiceData: any;
  isEditing: boolean;
  toggleEdit: () => void;
}

export const InvoiceDetailsFill: React.FC<Props> = ({
  invoiceData,
  isEditing,
  toggleEdit,
}) => {
  const { mutateAsync } = useUpdateInvoiceMutation();
  const defaults = React.useMemo(
    () => ({
      firstName: invoiceData.firstName,
      lastName: invoiceData.lastName,
      company: invoiceData.company,
      phone: invoiceData.phone,
      vatNumber: invoiceData.vatNumber,
      address: invoiceData.address,
      country: invoiceData.country,
    }),
    [
      invoiceData?.firstName,
      invoiceData?.lastName,
      invoiceData?.company,

      invoiceData?.vatNumber,
      invoiceData?.address,
      invoiceData?.country,
    ],
  );
  const onSubmit = async (formData: any) => {
    console.log(formData, "wad");
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company,

      vatNumber: formData.vatNumber,
      address: formData.address,
      country: formData.country,
    };

    await mutateAsync(payload);
    toggleEdit();
  };
  return (
    <div className="invoice-details-client__invoice">
      <div className="invoice-details-client__subtitle">
        <h3>Invoice details</h3>
        <Edit active={isEditing} onChange={toggleEdit} />
      </div>
      {isEditing ? (
        <Form
          defaultValues={defaults}
          onSubmit={onSubmit}
          submitButton={<SubmitButton className="mt" data="Save" />}>
          <InvoiceSettingsForm data={invoiceData} />
        </Form>
      ) : (
        <FillData data={invoiceData} fields={invoiceFields} />
      )}
    </div>
  );
};
