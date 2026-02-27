import { normalizeAgreementResponse } from "@/pages/influencer/agreement/utils/normalizeAgreementResponse.ts";
// import { handleApiError } from "@/api/error.api.ts";
import { agreementHandler, getAgreement } from "@/api/influencer/agreement/agreement.api.ts";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { TAgreementStats } from "@/pages/influencer/agreement/types/agreement.types.ts";

export const useAgreementQuery = (influencerId: string) => {
  return useQuery({
    queryKey: ['agreement', influencerId],
    enabled: !!influencerId,
    queryFn: async () => {
      const data = await getAgreement(influencerId);

      return normalizeAgreementResponse(data);
    },

    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    // retry: false,
  });
};

export const useAgreementHandlerMutation = () => {
  // const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      influencerId,
      action,
    }: {
      influencerId: string;
      action: TAgreementStats;
    }) => {
      return agreementHandler(influencerId, action);
    },
    onSuccess: () => {
      console.log("Agreement action successful");
      // qc.invalidateQueries({ queryKey: qk.agreement });
    },
  });
};