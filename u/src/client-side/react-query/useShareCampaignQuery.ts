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
      return data;
    },
    enabled: !!id,
    ...options,
    staleTime: 60_000,
  });
};
