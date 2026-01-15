/*
  structure of table head columns:
  invoice id | date issued | payment method | amount | status (submitted, paid, overdue)
*/
// import type { TInvoicePaymentMethod } from "../../../../types/influencer/form/invoice/payment-method.types";

export interface IInvoiceDetailsItem {
  invoiceId: string;
  dateIssued: string; // ISO date string
  paymentMethod: string;
  amount: number; // in cents
  status: 'submitted' | 'paid' | 'overdue';
  description?: string;
};