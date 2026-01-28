import type { TInvoicePaymentMethod } from "../../create-invoice/components/payment-bar/types/payment-method.types";

export const normalizePaymentMethodLabel = (method: TInvoicePaymentMethod): string => {
  switch (method.toLowerCase()) {
    case 'paypal':
      return 'Paypal';
    case 'ukBankTransfer':
      return 'UK Bank Transfer';
    case 'internationalBankTransfer':
      return 'International Bank Transfer';
    default:
      return 'N/A';
  }
};