import { useDebouncedValue } from "@/hooks/client/useDebouncedValue";
import { usePromoAccountsFilters } from "@/pages/client/react-query/usePromoAccountQuery";
import { useSearchSocialAccountsQuery } from "@/pages/client/react-query/usePromoAccountSearch";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { SocialMediaType } from "@/types/utils/constants.types";

export const usePromoAccountsOrSearch = ({
  selected,
  budget,
  currency,
  sortBy,
  query,
  FilterMethod,
}: {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
  query: string;
  FilterMethod: string;
}) => {
  const debounced = useDebouncedValue(query, 150);
  const q = debounced.trim();
  const isSearchMode = q.length >= 2;

  const socialMedias = selected
    .filter((x) => x.group === "socialMedia")
    .map((x) => x.id as SocialMediaType);

  const filtered = usePromoAccountsFilters(
    { selected, budget, currency, sortBy, FilterMethod },
    { enabled: !isSearchMode && socialMedias.length > 0 },
  );

  const searched = useSearchSocialAccountsQuery({
    query: q,
    socialMedias,
    page: 1,
    limit: 20,
  });

  const active = isSearchMode ? searched : filtered;

  return {
    isSearchMode,
    query: q,

    // данные
    data: isSearchMode
      ? (searched.data?.data?.accounts ?? [])
      : (filtered.data ?? []),

    // статусы
    isFetching: active.isFetching,
    isLoading: active.isLoading,
    isError: active.isError,
    error: active.error ?? null,

    // действия
    refetch: active.refetch,
  };
};
