import { useQuery } from "@tanstack/react-query";
import { getPublishedOffers } from "@/api/client/creator-campaign-page/offers.api";
import type { SocialMediaType } from "@/types/utils/constants.types";
import axios from "axios";

export const usePublishedOffersQuery = (
  platform: SocialMediaType,
  genre: string,
) => {
  return useQuery({
    queryKey: ["publishedOffers", platform, genre],
    queryFn: () => getPublishedOffers(platform, genre),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if(axios.isAxiosError(error)) {
        const status = error.response?.status;
        if(status === 400 || status === 403) {
          return false
        }
      }
      return  failureCount < 1;
    }
  });
};
