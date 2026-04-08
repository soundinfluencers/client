import {
  getDetailedPromo,
} from "@/api/influencer/promos/influencer-promos.api";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseDetailedPromosParams {
  status: string;
  campaignId?: string;
  addedAccountsId?: string;
  limit?: number;
  enabled?: boolean;
}

export const useDetailedPromos = ({
  status,
  campaignId,
  addedAccountsId,
  limit = 12,
  enabled = true,
}: UseDetailedPromosParams) => {
  return useInfiniteQuery({
    queryKey: [
      "detailedPromos",
      status,
      campaignId ?? null,
      addedAccountsId ?? null,
      limit,
    ],
    initialPageParam: 1,

    queryFn: ({ pageParam = 1 }) => {
      console.log("FETCH", { status, campaignId, addedAccountsId, limit, pageParam });
      return getDetailedPromo({
        status,
        campaignId,
        addedAccountsId,
        limit,
        page: pageParam,
      });
    },

    getNextPageParam: (lastPage, pages) => {
      return lastPage?.length < limit ? undefined : pages.length + 1;
    },

    select: (data) => {
      const promos = data.pages.flat();
      // TODO: remove when backend filters closed promos correctly
      const filtered = status === "ongoing" ?
        promos.filter((promo) => promo.closedStatus !== "close") : promos;

      console.log(filtered);
      return { promos: filtered };
    },

    enabled,
  });
};
