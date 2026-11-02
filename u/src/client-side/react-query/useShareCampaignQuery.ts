import { toPublicShareCampaign } from "@/client-side/pages/campaign-share/model/share-campaign-read";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getShareLink } from "@/api/client/campaign/campaign.api";

export const useShareCampaignQuery = (
  id?: string,
  options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["shareCampaign", id],
    queryFn: async () => {
      const { data } = await getShareLink(id!);
      return toPublicShareCampaign(data);
    },
    enabled: !!id,
    refetchOnMount: "always",
    ...options,
    staleTime: 60_000,
  });
};
