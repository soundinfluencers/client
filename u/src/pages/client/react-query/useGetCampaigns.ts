import { getCampaigns } from "@/api/client/campaign/campaign.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetCampaignsQuery = ({
  status,
  limit,
}: {
  status: string;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["getCampaigns", status, limit],
    queryFn: async () => {
      return getCampaigns(status, 1, limit);
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
};
