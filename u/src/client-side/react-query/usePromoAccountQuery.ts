import { getMultiPromoAccounts } from "@/api/client/creator-campaign-page/promo-accounts.api";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Params = {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
  filterMethod: string;
  limit: number;
};

export const usePromoAccountsFilters = (
    {
      selected,
      budget,
      currency,
      sortBy,
      filterMethod,
      limit,
    }: Params,
    options?: { enabled: boolean },
) => {
  const socialMedias = selected
      .filter((item) => item.group === "socialMedia")
      .map((item) => item.id);

  const countries = selected
      .filter((item) => item.group === "countries")
      .flatMap((item) =>
          item.children?.length ? item.children.map((child) => child.id) : item.id,
      );

  const genres = selected
      .filter((item) => item.group === "genres")
      .flatMap((item) => {
        const parent = item.id;

        if (item.children?.length) {
          return item.children.map((child) => `${parent} ${child.id}`.trim());
        }

        return [parent];
      });

  const profileType = selected
      .filter((item) => item.group === "profileType")
      .map((item) => item.id);

  const additionalTopics = selected
      .filter((item) => item.group === "addTopics")
      .map((item) => item.id);

  const musicCategories = selected
      .filter((item) => item.group === "musicCategories")
      .map((item) => item.id);

  const key = JSON.stringify({
    socialMedias: [...socialMedias].sort(),
    countries: [...countries].sort(),
    genres: [...genres].sort(),
    profileType: [...profileType].sort(),
    additionalTopics: [...additionalTopics].sort(),
    musicCategories: [...musicCategories].sort(),
    musicGenresFilterMethod: filterMethod,
    budget,
    currency,
    sortBy,
    limit,
  });

  return useQuery({
    queryKey: ["promoAccounts", key],
    queryFn: async () => {
      const { data } = await getMultiPromoAccounts({
        body: {
          socialMedias,
          countries,
          additionalTopics,
          profileTypes: profileType,
          musicCategories,
          musicGenresFilterMethod: filterMethod,
          musicGenres: genres,
          budget,
          currency,
        },
        sortBy,
        limit,
        page: 1,
      });

      return data.accounts ?? [];
    },
    enabled: options?.enabled ?? socialMedias.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (accounts) => accounts ?? [],
  });
};