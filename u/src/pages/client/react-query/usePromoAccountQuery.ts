import { getMultiPromoAccounts } from "@/api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";

import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import { useQuery } from "@tanstack/react-query";

export const usePromoAccountsFilters = (
  {
    selected,
    budget,
    currency,
    sortBy,
    FilterMethod,
  }: {
    selected: FilterItem[];
    budget: string;
    currency: string;
    sortBy: string;
    FilterMethod: string;
  },
  options?: { enabled: boolean },
) => {
  const socialMedias = selected
    .filter((item) => item.group === "socialMedia")
    .map((item) => item.id);

  const countries = selected
    .filter((item) => item.group === "countries")
    .flatMap((item) => {
      if (item.children && item.children.length > 0) {
        return item.children.map((child) => child.id);
      }

      return item.id;
    });
  const genres = selected
    .filter((item) => item.group === "genres")
    .flatMap((item) => {
      const parent = item.id;

      if (item.children?.length) {
        return item.children.map((child) => {
          return `${parent} ${child.id}`.trim();
        });
      }

      return [parent];
    });
  console.log(genres, "wlkwwklwk");
  const profileType = selected
    .filter((item) => item.group === "profileType")
    .map((item) => item.id);
  const Additionaltopics = selected
    .filter((item) => item.group === "addTopics")
    .map((item) => item.id);

  const MusicCategories = selected
    .filter((item) => item.group === "musicCategories")
    .map((item) => item.id);
  const key = {
    socialMedias: [...socialMedias].sort(),
    countries: [...countries].sort(),
    genres: [...genres].sort(),
    profileType: [...profileType].sort(),
    Additionaltopics: [...Additionaltopics].sort(),
    MusicCategories: [...MusicCategories].sort(),
    musicGenresFilterMethod: FilterMethod,
    budget,
    currency,
    sortBy,
  };
  return useQuery({
    queryKey: ["promoAccounts", key],
    queryFn: async () => {
      const { data } = await getMultiPromoAccounts({
        body: {
          socialMedias,
          countries: countries,
          additionalTopics: Additionaltopics,
          profileTypes: profileType,
          musicCategories: MusicCategories,
          musicGenresFilterMethod: FilterMethod,
          musicGenres: genres,
          budget,
          currency,
        },
        sortBy,
        limit: 100000000,
        page: 1,
      });
      return data.accounts;
    },
    enabled: options?.enabled ?? socialMedias.length > 0,
    keepPreviousData: true,
    staleTime: 30_000,
  });
};
