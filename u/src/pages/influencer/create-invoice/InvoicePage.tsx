import { Breadcrumbs, Container, Form, Loader } from "@/components";
import { InvoiceFormContent } from './components/invoice-form-content/InvoiceFormContent';
import { invoicePayloadSchema } from './components/invoice-form-content/validation/schema';
import './_invoice-page.scss'
import { useEffect, useState } from "react";
import type {
  InvoiceFormValues,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";
import { useInfluencerInvoice } from "@/pages/influencer/shared/hooks/useInfluencerInvoice.ts";
import type {
  TInvoicePaymentMethod,
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import { useUser } from "@/store/get-user";
import {
  getCreateInvoiceDefaultValues
} from "@/pages/influencer/create-invoice/utils/getCreateInvoiceDefaultValues.ts";

export const InvoicePage = () => {
  const { user } = useUser();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const {
    invoiceDetails,
    paymentDetails,
    isLoadingInvoiceDetails,
    isLoadingPaymentDetails,
    isErrorInvoiceDetails,
    isErrorPaymentDetails,
  } = useInfluencerInvoice();

  const [createInvoiceTab, setCreateInvoiceTab] = useState<TInvoicePaymentMethod>('ukBankTransfer');

  if (isLoadingInvoiceDetails || isLoadingPaymentDetails) {
    return (<Loader />);
  }

  if (isErrorInvoiceDetails || isErrorPaymentDetails) {
    return (<div>Error loading data. Please try again later.</div>);
  }

  const defaultValues = getCreateInvoiceDefaultValues(
    invoiceDetails,
    paymentDetails,
    createInvoiceTab,
    user?.balance);

  console.log('Default form values:', defaultValues);

  return (
    <Container className="invoice-page">
      <Breadcrumbs/>

      <h2 className="invoice-page__title">Payment method</h2>

      <Form<InvoiceFormValues>
        className="invoice-page__form"
        schema={invoicePayloadSchema}
        defaultValues={defaultValues}
      >
        <InvoiceFormContent tab={createInvoiceTab} setTab={setCreateInvoiceTab}/>
      </Form>
    </Container>
  );
};