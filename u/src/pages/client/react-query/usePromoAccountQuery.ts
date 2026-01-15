import { getMultiPromoAccounts } from "@/api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";

import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import { useQuery } from "@tanstack/react-query";

export const usePromoAccountsQuery = ({
  selected,
  budget,
  currency,
  sortBy,
}: {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
}) => {
  const socialMedias = selected.map((item) => item.id);

  return useQuery({
    queryKey: ["promoAccounts", socialMedias, budget, currency, sortBy],
    queryFn: async () => {
      const { data } = await getMultiPromoAccounts({
        body: {
          socialMedias,
          countries: ["US"],
          budget,
          currency,
        },
        sortBy,
        limit: 12,
        page: 1,
      });
      return data.accounts;
    },
    enabled: socialMedias.length > 0,
    keepPreviousData: true,
  });
};
