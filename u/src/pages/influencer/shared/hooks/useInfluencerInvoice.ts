import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getInfluencerInvoiceDetails, getInfluencerPaymentMethod,
  updateInfluencerInvoiceDetails, updateInfluencerPaymentMethod,
} from "@/api/influencer/profile/influencer-profile.api.ts";
import { toast } from "react-toastify";
import { handleApiError } from "@/api/error.api.ts";
import { createInvoice } from "@/api/influencer/create-invoice/create-invoice.api.ts";
import { useRefreshMe } from "@/pages/influencer/shared/hooks/useRefreshMe.ts";

const INVOICE_DETAILS_PAGE_QUERY_KEY = 'influencerInvoiceDetails';
const INFLUENCER_PAYMENT_DETAILS_QUERY_KEY = 'influencerPaymentDetails';

export const useInfluencerInvoice = () => {
  const qc = useQueryClient();

  // Invoice details form state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Create invoice form state
  const refreshMe = useRefreshMe();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ------ INVOICE DETAILS FORM: query + mutation ------
  const invoiceDetailsQuery = useQuery({
    queryKey: [INVOICE_DETAILS_PAGE_QUERY_KEY],
    queryFn: getInfluencerInvoiceDetails,
  });
  const invoiceDetailsMutation = useMutation({
    mutationFn: updateInfluencerInvoiceDetails,
    onSuccess: (data) => {
      qc.setQueryData([INVOICE_DETAILS_PAGE_QUERY_KEY], data);
      toast.success('Invoice details updated successfully!');
      setIsFormOpen(false);
    },
    onError: handleApiError,
  });
  // ------ END OF INVOICE DETAILS FORM: query + mutation ------

  // ----- PAYMENT DETAILS: query + mutation ------
  const paymentDetailsQuery = useQuery({
    queryKey: [INFLUENCER_PAYMENT_DETAILS_QUERY_KEY],
    queryFn: getInfluencerPaymentMethod,
  });
  const paymentDetailsMutation = useMutation({
    mutationFn: updateInfluencerPaymentMethod,
    onSuccess: async (data) => {
      qc.setQueryData([INFLUENCER_PAYMENT_DETAILS_QUERY_KEY], (old) => {
        if (!old) return old;

        return { ...old, ...data };
      });
      toast.success("Payment details updated successfully");
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  // ----- END OF PAYMENT DETAILS: query + mutation ------

  // ----- CREATE INVOICE FORM: mutation ------
  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: async () => {
      console.log('Invoice submitted successfully');
      await refreshMe();
      console.log('User data refreshed successfully');
      setIsModalOpen(true);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  // ----- END OF CREATE INVOICE FORM: mutation ------

  return {
    // ---- INVOICE DETAILS FORM STATE & HANDLERS ----
    isFormOpen,
    closeForm: () => setIsFormOpen(false),
    toggleForm: () => setIsFormOpen((prev) => !prev),
    invoiceDetails: invoiceDetailsQuery.data,
    isLoadingInvoiceDetails: invoiceDetailsQuery.isLoading,
    isErrorInvoiceDetails: invoiceDetailsQuery.isError,
    errorInvoiceDetails: invoiceDetailsQuery.error,
    saveInvoiceDetails: invoiceDetailsMutation.mutate,
    isSavingInvoiceDetails: invoiceDetailsMutation.isPending,
    // ---- END OF INVOICE DETAILS FORM STATE & HANDLERS ----

    // ---- PAYMENT DETAILS STATE & HANDLERS ----
    paymentDetails: paymentDetailsQuery.data,
    isLoadingPaymentDetails: paymentDetailsQuery.isLoading,
    isErrorPaymentDetails: paymentDetailsQuery.isError,
    errorPaymentDetails: paymentDetailsQuery.error,
    savePaymentDetails: paymentDetailsMutation.mutate,
    isSavingPaymentDetails: paymentDetailsMutation.isPending,
    // ---- END OF PAYMENT DETAILS STATE & HANDLERS ----

    // ---- CREATE INVOICE FORM: state & handlers ----
    isModalOpen,
    setIsModalOpen,
    saveInvoice: createInvoiceMutation.mutate,
    isSavingInvoice: createInvoiceMutation.isPending,
    // ---- END OF CREATE INVOICE FORM: state & handlers ----
  };
};