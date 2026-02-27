import { Breadcrumbs, Container, Loader } from "@/components";
import { EditButton } from "@components/ui/edit-button/EditButton.tsx";
import {
  InvoiceDetailsForm
} from "@/pages/influencer/invoice-details/components/invoice-details-form/InvoiceDetailsForm.tsx";
import {
  InvoiceDetailsInfoList
} from "@/pages/influencer/invoice-details/components/invoice-details-info-list/InvoiceDetailsInfoList.tsx";

import './_invoice-details.scss';
import { useInfluencerInvoice } from "@/pages/influencer/shared/hooks/useInfluencerInvoice.ts";

export const InvoiceDetails = () => {
  const {
    isLoadingInvoiceDetails,
    isErrorInvoiceDetails,
    invoiceDetails,
    isFormOpen,
    isSavingInvoiceDetails,
    toggleForm,
    saveInvoiceDetails,
    closeForm } = useInfluencerInvoice();

  console.log("Payment details query result:", invoiceDetails);

  if (isLoadingInvoiceDetails) {
    return <Loader />;
  }
  if (isErrorInvoiceDetails) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading invoice details.</div>;
  }
  if (!invoiceDetails) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>No invoice details found.</div>;
  }

  return (
    <Container className="invoice-details-page">
      <Breadcrumbs/>

      <div className={"invoice-details-page__content"}>
        <div className="invoice-details-page__header">
          <h2 className={'invoice-details-page__title'}>Invoice Details</h2>
          <EditButton
            className={isFormOpen ? 'active' : ''}
            variants={'account'}
            onClick={toggleForm}
          />
        </div>
        {isFormOpen ?
          <InvoiceDetailsForm
            invoiceDetails={invoiceDetails}
            onSave={saveInvoiceDetails}
            isSaving={isSavingInvoiceDetails}
            onClose={closeForm}
          />
          :
          <InvoiceDetailsInfoList invoiceDetails={invoiceDetails} />}
      </div>
    </Container>
  );
};