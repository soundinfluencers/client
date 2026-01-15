import payPal from '../../../../assets/payments-icons/PayPal.svg';
import ukBankTransfer from '../../../../assets/payments-icons/BankTransfer.svg';
import internationalBankTransfer from '../../../../assets/payments-icons/international-bank-transfer.svg';
import type { TInvoicePaymentMethod } from '../../../../types/influencer/form/invoice/payment-method.types';

export interface IInvoicePaymentMethodTab {
  id: TInvoicePaymentMethod;
  label: string;
  icon: string;
};

export const INVOICE_PAYMENT_METHODS_TABS: IInvoicePaymentMethodTab[] = [
  { id: 'UKBankTransfer', label: 'UK Bank Transfer', icon: ukBankTransfer },
  { id: 'InternationalBankTransfer', label: 'International Bank Transfer', icon: internationalBankTransfer },
  { id: 'PayPal', label: 'PayPal', icon: payPal },
];

export function getInvoicePaymentMethodLabel(id: TInvoicePaymentMethod): string {
  const method = INVOICE_PAYMENT_METHODS_TABS.find((method) => method.id === id);
  return method ? method.label : '';
};