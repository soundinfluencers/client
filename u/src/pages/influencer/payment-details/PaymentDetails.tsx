import { useState } from "react";
import { useInfluencerInvoice } from "@/pages/influencer/shared/hooks/useInfluencerInvoice.ts";
import { Breadcrumbs, Container, Form, Loader } from "@/components";
import { PaymentDetailsFormContent } from "@/pages/influencer/payment-details/components/PaymentDetailsFormContent.tsx";
import {
  getDefaultValuesPaymentDetailsForm
} from "@/pages/influencer/payment-details/utils/getDefaultValuesPaymentDetailsForm.ts";
import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";

import './_payment-details.scss';

//TODO: compare default values with form values on submit, if they are the same, just close the form without making an API call
export const PaymentDetails = () => {
  const {
    paymentDetails,
    isLoadingPaymentDetails,
    isErrorPaymentDetails,
    errorPaymentDetails,
  } = useInfluencerInvoice();

  const [paymentDetailsTab, setPaymentDetailsTab] = useState<TInvoicePaymentMethod>('ukBankTransfer');

  console.log("Payment details query result:", paymentDetails);
  console.log("Default values for payment details form:", getDefaultValuesPaymentDetailsForm(paymentDetails, paymentDetailsTab));

  return (
    <Container className="payment-details-page">
      <Breadcrumbs/>
      <h2 className={"payment-details-page__title"}>Payment details</h2>

      {isLoadingPaymentDetails ? (<Loader />)
        : isErrorPaymentDetails ? (
        <p>Error loading payment details: {errorPaymentDetails instanceof Error ? errorPaymentDetails.message : "Unknown error"}</p>)
        : (
        <Form
          className={"payment-details-page__form"}
          defaultValues={getDefaultValuesPaymentDetailsForm(paymentDetails, paymentDetailsTab)}
        >
          <PaymentDetailsFormContent tab={paymentDetailsTab} setTab={setPaymentDetailsTab} />
        </Form>
      )}
    </Container>
  );
};