import { getCampaigns } from "@/api/client/dashboard/client-campaign.api";
import { useQuery } from "@tanstack/react-query";

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
      return getCampaigns(status, 1, limit); // всегда 1-я страница
    },
    keepPreviousData: true,
    staleTime: 15_000,
  });
};
