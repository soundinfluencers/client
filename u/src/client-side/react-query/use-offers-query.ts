import { useQuery } from "@tanstack/react-query";
import { getPublishedOffers } from "@/api/client/creator-campaign-page/offers.api";
import type { SocialMediaType } from "@/types/utils/constants.types";

export const usePublishedOffersQuery = (
  platform: SocialMediaType,
  genre: string,
) => {
  return useQuery({
    queryKey: ["publishedOffers", platform, genre],
    queryFn: () => getPublishedOffers(platform, genre),
    staleTime: 30_000,
  });
};
