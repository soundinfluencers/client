// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   getInfluencerInvoiceDetails,
//   updateInfluencerInvoiceDetails,
// } from "@/api/influencer/profile/influencer-profile.api.ts";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import { handleApiError } from "@/api/error.api.ts";
//
// export const INVOICE_DETAILS_PAGE_QUERY_KEY = 'influencer-invoice-details';
//
// export const useInvoiceDetailsPage = () => {
//   const qc = useQueryClient();
//   const [isFormOpen, setIsFormOpen] = useState(false);
//
//   const query = useQuery({
//     queryKey: [INVOICE_DETAILS_PAGE_QUERY_KEY],
//     queryFn: getInfluencerInvoiceDetails,
//   });
//
//   const mutation = useMutation({
//     mutationFn: updateInfluencerInvoiceDetails,
//     onSuccess: (data) => {
//       qc.setQueryData([INVOICE_DETAILS_PAGE_QUERY_KEY], data);
//       toast.success('Invoice details updated successfully!');
//       setIsFormOpen(false);
//     },
//     onError: handleApiError,
//   });
//
//   return {
//     isFormOpen,
//     closeForm: () => setIsFormOpen(false),
//     toggleForm: () => setIsFormOpen((prev) => !prev),
//
//     invoiceDetails: query.data,
//     isLoading: query.isLoading,
//     isError: query.isError,
//     error: query.error,
//
//     save: mutation.mutate,
//     isSaving: mutation.isPending,
//   };
// };