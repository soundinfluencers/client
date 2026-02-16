import type { IPaymentCampaignField } from "@/types/client/form-clients/payment-campaign-inputs";

export const PAYMENT_CAMPAIGN_TABS_INPUTS: IPaymentCampaignField = {
  formType: "payment",
  inputs: [
    {
      label: "First name*",
      name: "firstName",
      placeholder: "Enter first name",
    },
    { label: "Last name*", name: "lastName", placeholder: "Enter last name" },
    { label: "Address*", name: "address", placeholder: "Enter address" },
    { label: "Country*", name: "country", placeholder: "Enter country" },
    {
      label: "Company (optional)",
      name: "company",
      placeholder: "Enter company",
    },
    {
      label: "VAT number (only if VAT registered)",
      name: "vatNumber",
      placeholder: "Enter VAT number",
    },
  ],
};
