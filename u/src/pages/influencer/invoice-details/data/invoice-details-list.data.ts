import type {
  IInvoiceDetailsField,
} from "@/pages/influencer/invoice-details/types/invoice-details.types.ts";
import type {
  IPaymentMethodField,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";

// Base map data for invoice list fields
export const INVOICE_DETAILS_FIELDS = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'address', label: 'Address' },
  { key: 'country', label: 'Country' },
  { key: 'company', label: 'Company' },
  { key: 'vatNumber', label: 'VAT number' },
] satisfies readonly IInvoiceDetailsField[];

// Input fields data for invoice details form
export const INVOICE_DETAILS_INPUTS_DRAFT_DATA: IPaymentMethodField = {
  inputs: [
    {
      type: "text",
      label: "First name",
      name: "firstName",
      placeholder: "Enter first name",
    },
    {
      type: "text",
      label: "Last name",
      name: "lastName",
      placeholder: "Enter last name",
    },
    {
      type: "text",
      label: "Address",
      name: "address",
      placeholder: "Enter address",
    },
    {
      type: "country",
      label: "Country",
      name: "country",
      placeholder: "Enter country",
    },
    {
      type: "text",
      label: "Company (optional)",
      name: "company",
      placeholder: "Enter company",
    },
    {
      type: "text",
      label: "VAT number (only if VAT registered)",
      name: "vatNumber",
      placeholder: "Enter VAT number",
    },
  ],
};