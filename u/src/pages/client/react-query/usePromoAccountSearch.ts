// useSearchSocialAccounts.ts
import { searchSocialAccounts } from "@/api/client/post-actions/post-search-promos";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { useQuery } from "@tanstack/react-query";

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

  return useQuery({
    queryKey: [
      "socialAccountSearch",
      { q, socialMedias: [...socialMedias].sort(), page, limit },
    ],
    queryFn: () =>
      searchSocialAccounts({ query: q, socialMedias, page, limit }),
    enabled: q.length >= 2 && socialMedias.length > 0,
    keepPreviousData: true,
    staleTime: 15_000,
  });
};
