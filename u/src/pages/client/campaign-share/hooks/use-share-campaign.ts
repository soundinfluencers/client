import { useQuery } from "@tanstack/react-query";
import { getShareLink } from "@/api/client/campaign/campaign.api";

export const useShareCampaignQuery = (id?: string) => {
  return useQuery({
    queryKey: ["shareCampaign", id],
    queryFn: async () => {
      const { data } = await getShareLink(id!);
      return data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
};
