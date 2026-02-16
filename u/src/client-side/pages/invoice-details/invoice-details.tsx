import React from "react";

import { Breadcrumbs, Container } from "@/components";

import "./_invoice-details.scss";
import { useInvoceDetailsQuery } from "@/client-side/react-query";
import { InvoiceDetailsFill } from "@/client-side/widgets";
interface Props {}

export const InvoiceDetails: React.FC<Props> = () => {
  const [invoiceFlag, setInvoiceFlag] = React.useState(false);
  const { data: InvoiceDetails, isLoading } = useInvoceDetailsQuery();
  console.log(InvoiceDetails, "InvoiceDetails");
  const invoiceData = {
    firstName: InvoiceDetails?.firstName || "No data",
    lastName: InvoiceDetails?.lastName || "No data",
    address: InvoiceDetails?.address || "No data",
    country: InvoiceDetails?.country || "No data",
    company: InvoiceDetails?.company || "No data",
    vatNumber: InvoiceDetails?.vatNumber || "No data",
  };

  return (
    <Container className="invoice-details-client">
      <div className="invoice-details-client__navigation">
        <Breadcrumbs />
      </div>

      <div className="invoice-details-client__content">
        <InvoiceDetailsFill
          invoiceData={invoiceData}
          isEditing={invoiceFlag}
          toggleEdit={() => setInvoiceFlag((prev) => !prev)}
        />
      </div>
    </Container>
  );
};
