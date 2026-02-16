// import { useInvoiceDetailsStore } from "@/pages/influencer/invoice-details/store/useInvoiceDetails.ts";
import { INVOICE_DETAILS_FIELDS } from "@/pages/influencer/invoice-details/data/invoice-details-list.data.ts";

import './_invoice-details-info-list.scss';
import type { TInvoiceDetailsApi } from "@/pages/influencer/invoice-details/types/invoice-details.types.ts";
import React from "react";

interface Props {
  invoiceDetails: TInvoiceDetailsApi;
}

export const InvoiceDetailsInfoList: React.FC<Props> = ({invoiceDetails}) => {
  // const { invoiceDetails } = useInvoiceDetailsStore();
  console.log('invoiceDetails list:', invoiceDetails);
  return (
    <ul className="invoice-details-info-list">
      {INVOICE_DETAILS_FIELDS.map(({ key, label }) => (
        <li key={key} className="invoice-details-info-list__item">
          <span className="invoice-details-info-list__label">{label}</span>
          <span className="invoice-details-info-list__value">{invoiceDetails?.[key] ? invoiceDetails?.[key] : 'No date'}</span>
        </li>
      ))}
    </ul>
  );
};