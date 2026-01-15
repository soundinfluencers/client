type inputs = {
  label: string;
  name: string;
  placeholder: string;
};

export interface IPaymentCampaignField {
  formType: "payment";
  inputs: inputs[];
}
export type CurrencyType = "UK" | "EU" | "International";
