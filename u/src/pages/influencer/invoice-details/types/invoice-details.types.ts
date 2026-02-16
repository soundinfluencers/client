import type {
  InvoiceFormValues
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";

// Types for invoice details fields list
export type TInvoiceDetailsKey  = 'firstName' | 'lastName' | 'address' | 'country' | 'company' | 'vatNumber';
export interface IInvoiceDetailsField  {
  key: TInvoiceDetailsKey ;
  label: string;
}

// Types for invoice details form
export type TInvoiceDetailsFormValues = Pick<InvoiceFormValues, TInvoiceDetailsKey>;

// Exporting API DTO type
export type TInvoiceDetailsApi = Partial<TInvoiceDetailsFormValues>;

// Types for API payloads
export type TUpdateInvoiceDetailsDto  = Partial<TInvoiceDetailsFormValues>;