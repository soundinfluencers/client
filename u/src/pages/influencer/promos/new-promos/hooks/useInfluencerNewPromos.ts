import { getDetailedNewPromos } from "@/api/influencer/promos/influencer-promos.api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { mapNewPromos } from "../utils/new-promos.mapper";

interface UseInfluencerNewPromosParams {
  campaignId?: string;
  addedAccountsId?: string;
  limit?: number;
  enabled?: boolean;
}

export const useInfluencerNewPromos = ({
  campaignId,
  addedAccountsId,
  limit = 12,
  enabled = true,
}: UseInfluencerNewPromosParams = {}) => {
  return useInfiniteQuery({
    queryKey: [
      "detailedPromos",
      "new",
      campaignId ?? null,
      addedAccountsId ?? null,
      limit,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getDetailedNewPromos({
        status: "new",
        campaignId,
        addedAccountsId,
        limit,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < limit ? undefined : pages.length + 1,
    select: (data) => ({
      promos: mapNewPromos(data.pages.flat()),
    }),
    enabled,
  });
};
