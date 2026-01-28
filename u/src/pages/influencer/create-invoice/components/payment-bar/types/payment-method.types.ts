export type TInvoicePaymentMethod =
  | "paypal"
  | "ukBankTransfer"
  | "internationalBankTransfer";

export interface IInvoicePaymentMethodTab {
  id: TInvoicePaymentMethod;
  label: string;
  icon: string;
}
