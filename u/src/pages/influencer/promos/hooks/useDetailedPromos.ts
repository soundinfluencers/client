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
  enabled?: boolean;
}

export const useDetailedPromos = ({
  status,
  campaignId,
  addedAccountsId,
  limit = 12,
  enabled = true,
}: UseDetailedPromosParams) => {
  // console.log('call getInfluencerDetailsPromoByStatus with', { status, campaignId, addedAccountsId, limit });

  // Determine if we are fetching a single promo (when both campaignId and addedAccountsId are provided)
  const isSingle = !!campaignId && !!addedAccountsId;
  // Determine if we are fetching a list of promos (when neither campaignId nor addedAccountsId is provided)
  const isList = !campaignId && !addedAccountsId;
  // We should only fetch if we are either fetching a single promo or a list of promos, and if enabled is true
  const canFetch = enabled && (isSingle || isList);

  return useInfiniteQuery({
    queryKey: [
      "distributingOrCompleted-promos",
      status,
      isSingle ? "single" : "list",
      campaignId ?? null,
      addedAccountsId ?? null,
      limit,
    ],
    initialPageParam: 1,

    queryFn: ({ pageParam = 1 }) => {
      if (isSingle) {
        console.log("FETCH SINGLE", { status, campaignId, addedAccountsId });
        return getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId(
          status,
          campaignId!,
          addedAccountsId!,
        );
      }
      console.log("FETCH LIST", { status, limit, pageParam });
      return getInfluencerDetailsPromoByStatus(status, limit, pageParam);
    },

    getNextPageParam: (lastPage, pages) => {
      if (isSingle) return undefined;
      return lastPage?.length < limit ? undefined : pages.length + 1;
    },

    select: (data) => {
      const rawPromos = isSingle ? (data.pages?.[0] ?? []) : data.pages.flat();
      // TODO: remove when backend filters closed promos correctly
      const promos = status === "ongoing" ?
        rawPromos.filter((promo) => promo.closedStatus !== "close") : rawPromos;

      console.log(promos);
      return { promos };
    },

    enabled: canFetch,
  });
};
