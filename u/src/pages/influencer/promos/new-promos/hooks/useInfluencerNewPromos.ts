import { getInfluencerNewPromo } from "@/api/influencer/promos/influencer-promos.api";
import { useQuery } from "@tanstack/react-query";

export const useInfluencerNewPromos = () => {
  return useQuery({
    queryKey: ['influencer-new-promos'],
    queryFn: getInfluencerNewPromo,
  });
};