import React from "react";
import { Edit } from "@/components/ui/edit/edit";
import { Form } from "@/components";
import { FillData } from "../fill-data/fill-data";
import { invoiceFields } from "@/constants/client/account-settings-data";
import { InvoiceSettingsForm } from "@/pages/client/components/client-forms/account-settings";
import { SubmitButton } from "@/components/ui/submit-button/submit-button";

interface Props {
  invoiceData: any;
  isEditing: boolean;
  toggleEdit: () => void;
}

export const InvoiceDetailsSection: React.FC<Props> = ({
  invoiceData,
  isEditing,
  toggleEdit,
}) => {
  return (
    <div className="Account-settings__invoice">
      <div className="Account-settings__subtitle">
        <h3>Invoice details</h3>
        <Edit active={isEditing} onChange={toggleEdit} />
      </div>
      {isEditing ? (
        <Form submitButton={<SubmitButton data="Save" />}>
          <InvoiceSettingsForm data={invoiceData} />
        </Form>
      ) : (
        <FillData data={invoiceData} fields={invoiceFields} />
      )}
    </div>
  );
};
