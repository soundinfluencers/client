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
}: {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
  query: string;
}) => {
  const debounced = useDebouncedValue(query, 150);
  const q = debounced.trim();
  const isSearchMode = q.length >= 2;

  const socialMedias = selected
    .filter((x) => x.group === "socialMedia")
    .map((x) => x.id as SocialMediaType);

  const filtered = usePromoAccountsFilters(
    { selected, budget, currency, sortBy },
    { enabled: !isSearchMode && socialMedias.length > 0 },
  );

  const searched = useSearchSocialAccountsQuery({
    query: q,
    socialMedias,
    page: 1,
    limit: 20,
  });
  console.log("SEARCH STATE", {
    status: searched.status,
    fetchStatus: searched.fetchStatus,
    isFetching: searched.isFetching,
    isLoading: searched.isLoading,
    isError: searched.isError,
    error: searched.error,
    data: searched.data,
  });

  return {
    isSearchMode,
    query: q,
    data: isSearchMode
      ? (searched.data?.data.accounts ?? [])
      : (filtered.data ?? []),
    isFetching: isSearchMode ? searched.isFetching : filtered.isFetching,
    isLoading: isSearchMode ? searched.isLoading : filtered.isLoading,
    error: isSearchMode ? searched.error : filtered.error,
  };
};
