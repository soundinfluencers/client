import { Breadcrumbs, Container, Form, Loader } from "@/components";
import { InvoiceFormContent } from './components/invoice-form-content/InvoiceFormContent';
import { invoicePayloadSchema } from './components/invoice-form-content/validation/schema';
import './_invoice-page.scss'
import { useEffect, useState } from "react";
import type {
  InvoiceFormValues,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";
import type {
  TInvoicePaymentMethod,
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import { useUser } from "@/store/get-user";
import {
  getCreateInvoiceDefaultValues
} from "@/pages/influencer/create-invoice/utils/getCreateInvoiceDefaultValues.ts";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceDraft } from "@/api/influencer/create-invoice/create-invoice.api.ts";

export const InvoicePage = () => {
  const { user } = useUser();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [createInvoiceTab, setCreateInvoiceTab] = useState<TInvoicePaymentMethod>('ukBankTransfer');

  const { data, isPending, isError } = useQuery({
    queryKey: ["invoice-draft"],
    queryFn: getInvoiceDraft,
  });

  console.log("Invoice draft:", data);

  if (isPending) {
    return (<Loader />);
  }

  if (isError) {
    return (<div>Error loading data. Please try again later.</div>);
  }

  const defaultValues = getCreateInvoiceDefaultValues(
      data,
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