// import { handleApiError } from "@/api/error.api.ts";
import { agreementHandler, getAgreement } from "@/api/influencer/agreement/agreement.api.ts";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { TAgreementStats } from "@/pages/influencer/agreement/types/agreement.types.ts";
import { normalizeAgreementResponse } from "@/pages/influencer/agreement/utils/normalizeAgreementResponse.ts";

export const useAgreementQuery = (influencerId: string) => {
  return useQuery({
    queryKey: ["agreement", influencerId],
    enabled: Boolean(influencerId),
    queryFn: () => getAgreement(influencerId),

    select: (data) => normalizeAgreementResponse(data),

    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
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
