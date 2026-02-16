import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { SocialMediaType } from "@/types/utils/constants.types";
import {
  usePromoAccountsFilters,
  useSearchSocialAccountsQuery,
} from "../react-query";
import { useDebouncedValue } from "@/hooks/client/useDebouncedValue";

export const usePromoCardsAndSearch = ({
  selected,
  budget,
  currency,
  sortBy,
  query,
  FilterMethod,
  limit,
}: {
  selected: any[];
  budget: string;
  currency: string;
  sortBy: string;
  query: string;
  FilterMethod: string;
  limit: number;
}) => {
  const debounced = useDebouncedValue(query, 200);
  const q = debounced.trim();
  const isSearchMode = q.length >= 1;

  const socialMedias = selected
    .filter((x) => x.group === "socialMedia")
    .map((x) => x.id as SocialMediaType);

  const promo = usePromoAccountsFilters(
    { selected, budget, currency, sortBy, FilterMethod, limit },
    { enabled: socialMedias.length > 0 },
  );

  const searchRes = useSearchSocialAccountsQuery({
    query: q,
    socialMedias,
    page: 1,
    limit: 20,
    enabled: isSearchMode,
  } as any);

  return {
    q,
    isSearchMode,

    promoCards: promo.data ?? [],
    promoLoading: promo.isLoading,
    promoFetching: promo.isFetching,
    promoError: promo.isError,
    promoRefetch: promo.refetch,

    searchResults: searchRes.data?.data?.accounts ?? [],
    searchLoading: searchRes.isLoading,
    searchFetching: searchRes.isFetching,
    searchError: searchRes.isError,
    searchRefetch: searchRes.refetch,
  };
};
