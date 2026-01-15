export type TInvoicePaymentMethod = 'PayPal' | 'UKBankTransfer' | 'InternationalBankTransfer';

export type TInputConfig = {
  type: 'text' | 'number';
  label: string;
  name: string;
  placeholder: string;
  description?: string;
};

export interface IPaymentMethodField {
  formType: "invoice";
  inputs: TInputConfig [];
};
