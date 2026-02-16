import { useDebouncedValue } from "@/hooks/client/useDebouncedValue";

import type { SocialMediaType } from "@/types/utils/constants.types";
import { useSearchSocialAccountsQuery } from "../react-query";

export const usePromoAccountsSearch = ({
  socialMedias,
  query,
  page = 1,
  limit = 20,
}: {
  socialMedias: SocialMediaType[];
  query: string;
  page?: number;
  limit?: number;
}) => {
  const debounced = useDebouncedValue(query, 150);
  const q = debounced.trim();

  const isSearchEnabled = q.length >= 2;

  const search = useSearchSocialAccountsQuery({
    query: q,
    socialMedias,
    page,
    limit,
  });

  return {
    query: q,
    isSearchEnabled,
    data: search.data?.data.accounts ?? [],
    isFetching: search.isFetching,
    isLoading: search.isLoading,
    error: search.error,
  };
};
