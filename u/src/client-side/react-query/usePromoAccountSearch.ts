import { searchSocialAccounts } from "@/api/client/search-accounts/post-search-promos";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useSearchSocialAccountsQuery = ({
  query,
  socialMedias,
  page,
  limit,
}: {
  query: string;
  socialMedias: SocialMediaType[];
  page: number;
  limit: number;
}) => {
  const q = query.trim();
  const key = JSON.stringify({
    q,
    socialMedias: [...socialMedias].sort(),
    page,
    limit,
  });

  return useQuery({
    queryKey: ["socialAccountSearch", key],
    queryFn: () =>
      searchSocialAccounts({ query: q, socialMedias, page, limit }),
    enabled: q.length >= 2 && socialMedias.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
