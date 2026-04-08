import type { FilterItem } from "@/types/client/creator-campaign/filters.types";

import {
  usePromoAccountsFilters,
  useSearchSocialAccountsQuery,
} from "../react-query";
import { useDebouncedValue } from "@/hooks/client/useDebouncedValue";
import type {SocialMedia} from "@/client-side/types/common.ts";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";

type Params = {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
  query: string;
  filterMethod: string;
  limit: number;
};

export const usePromoCardsAndSearch = ({
                                         selected,
                                         budget,
                                         currency,
                                         sortBy,
                                         query,
                                         filterMethod,
                                         limit,
                                       }: Params) => {
  const debounced = useDebouncedValue(query, 200);
  const q = debounced.trim();
  const isSearchMode = q.length >= 1;

  const socialMedias = selected
      .filter((item) => item.group === "socialMedia")
      .map((item) => item.id as SocialMedia);

  const promo = usePromoAccountsFilters(
      { selected, budget, currency, sortBy, filterMethod, limit },
      { enabled: socialMedias.length > 0 },
  );

  const searchRes = useSearchSocialAccountsQuery({
    query: q,
    socialMedias,
    page: 1,
    limit: 20,
  });

  return {
    q,
    isSearchMode,

    promoCards: (promo.data ?? []) as ConnectedAccount[],
    promoLoading: promo.isLoading,
    promoFetching: promo.isFetching,
    promoError: promo.isError,
    promoRefetch: promo.refetch,

    searchResults: (searchRes.data?.data?.accounts ?? []) as unknown as ConnectedAccount[],
    searchLoading: searchRes.isLoading,
    searchFetching: searchRes.isFetching,
    searchError: searchRes.isError,
    searchRefetch: searchRes.refetch,
  };
};