import { updateInvoceDetails } from "@/api/client/invoice/invoice.api";
import { updateProfile } from "@/api/client/profile/profile.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateInvoiceMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["updateInvoce"],
    mutationFn: (payload: any) => updateInvoceDetails(payload),

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["InvoiceDetails"] });
    },
  });
};
