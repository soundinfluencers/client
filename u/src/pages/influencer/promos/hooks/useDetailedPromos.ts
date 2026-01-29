import {
  getInfluencerDetailsPromoByStatus,
  getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId,
} from "@/api/influencer/promos/influencer-promos.api";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseDetailedPromosParams {
  status: string;
  campaignId?: string;
  addedAccountsId?: string;
  limit?: number;
}

export const useDetailedPromos = ({
  status,
  campaignId,
  addedAccountsId,
  limit = 12,
}: UseDetailedPromosParams) => {
  const isSingle = !!campaignId && !!addedAccountsId;

  return useInfiniteQuery({
    queryKey: [
      "distributingOrCompleted-promos",
      status,
      isSingle ? "single" : "list",
      isSingle ? campaignId! : limit,
      isSingle ? addedAccountsId! : null,
    ],
    initialPageParam: 1,

    queryFn: ({ pageParam = 1 }) => {
      if (isSingle) {
        return getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId(
          status,
          campaignId!,
          addedAccountsId!,
        );
      }
      return getInfluencerDetailsPromoByStatus(status, limit, pageParam);
    },

    getNextPageParam: (lastPage, pages) => {
      if (isSingle) return undefined;
      return lastPage?.length < limit ? undefined : pages.length + 1;
    },

    select: (data) => {
      const promos = isSingle ? (data.pages?.[0] ?? []) : data.pages.flat();
      return { promos };
    },

    enabled: true,
  });
};
