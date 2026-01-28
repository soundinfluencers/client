type inputs = {
  label: string;
  name: string;
  placeholder: string;
};

export interface IPaymentCampaignField {
  formType: "payment";
  inputs: inputs[];
}
export type CurrencyType =
  | "bank_transfer_uk"
  | "bank_transfer_eu"
  | "bank_transfer_international";
