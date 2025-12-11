import type { PaymentCampaignField } from "../types/form/payment-campaign-inputs";

export const PAYMENT_CAMPAIGN_TABS_INPUTS: PaymentCampaignField = {
  formType: "payment",
  inputs: [
    {
      label: "First name*",
      name: "First name*",
      placeholder: "Enter first name",
    },
    {
      label: "Last name*",
      name: "Last name*",
      placeholder: "Enter last name",
    },
    {
      label: "Address*",
      name: "Address*",
      placeholder: "Enter address",
    },
    {
      label: "Country*",
      name: "Country*",
      placeholder: "Enter country",
    },
    {
      label: "Company (optional)",
      name: "Company (optional)",
      placeholder: "Enter company",
    },
    {
      label: "VAT number (only if VAT registered)",
      name: "VAT number (only if VAT registered)",
      placeholder: "Enter VAT number",
    },
  ],
};
