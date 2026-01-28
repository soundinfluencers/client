import type { TInvoicePaymentMethod } from "../../create-invoice/components/payment-bar/types/payment-method.types";

export type TInvoiceStatus = "Submitted";

export interface IInvoiceResponseModel {
  shortInvoiceId: string;
  creationDate: string;
  paymentMethod: TInvoicePaymentMethod;
  amount: number;
  status: TInvoiceStatus;
};