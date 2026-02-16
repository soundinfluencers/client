import type {
  TInvoiceDetailsApi,
  TInvoiceDetailsFormValues,
} from "@/pages/influencer/invoice-details/types/invoice-details.types.ts";

export const getDefaultInvoiceDetailsValues =
  (
    invoiceDetails: TInvoiceDetailsApi | undefined
  ): TInvoiceDetailsFormValues => {

  console.log('invoiceDetails for default values:', invoiceDetails);
  return {
    firstName: invoiceDetails?.firstName ?? '',
    lastName: invoiceDetails?.lastName ?? '',
    address: invoiceDetails?.address ?? '',
    country: invoiceDetails?.country ?? '',
    company: invoiceDetails?.company ?? '',
    vatNumber: invoiceDetails?.vatNumber ?? '',
  };
};