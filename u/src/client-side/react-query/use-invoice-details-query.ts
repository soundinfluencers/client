import { getInvoiceDetails } from "@/api/client/invoice/invoice.api";
import { fetchProfileDetails } from "@/api/client/profile/profile.api";
import { useQuery } from "@tanstack/react-query";

export const useInvoceDetailsQuery = () => {
  return useQuery({
    queryKey: ["InvoiceDetails"],
    queryFn: getInvoiceDetails,
    staleTime: 60_000,
  });
};
