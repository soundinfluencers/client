import payPal from '../../../../../../assets/payments-icons/PayPal.svg';
import ukBankTransfer from '../../../../../../assets/payments-icons/BankTransfer.svg';
import internationalBankTransfer from '../../../../../../assets/payments-icons/international-bank-transfer.svg';
import type { IInvoicePaymentMethodTab, TInvoicePaymentMethod } from '../types/payment-method.types';

export const INVOICE_PAYMENT_METHODS_TABS: IInvoicePaymentMethodTab[] = [
  { id: 'ukBankTransfer', label: 'UK Bank Transfer', icon: ukBankTransfer },
  { id: 'internationalBankTransfer', label: 'International Bank Transfer', icon: internationalBankTransfer },
  { id: 'paypal', label: 'PayPal', icon: payPal },
];

export function getInvoicePaymentMethodLabel(id: TInvoicePaymentMethod): string {
  const method = INVOICE_PAYMENT_METHODS_TABS.find((method) => method.id === id);
  return method ? method.label : '';
};