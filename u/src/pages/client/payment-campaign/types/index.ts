export type PaymentMethodId =
  | "bank_card"
  | "paypal"
  | "bank_transfer_uk"
  | "bank_transfer_eu"
  | "bank_transfer_international";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";

export type PaymentTab = {
  id: PaymentTabId;
  label: string;
  icon: string;
  component: React.FC<any>;
};
