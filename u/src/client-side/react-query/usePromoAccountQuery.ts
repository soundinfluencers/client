import { getMultiPromoAccounts } from "@/api/client/creator-campaign-page/promo-accounts.api";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Params = {
  selected: FilterItem[];
  budget?: number | null;
  currency: string;
  sortBy: string;
  filterMethod: string;
  limit: number;
};

type ApiTargetGroup =
    | "communityMusicGenres"
    | "communityThemeTopics"
    | "creatorMusicGenres"
    | "creatorContentFocus";

const flattenSelectedItems = (items: FilterItem[]): FilterItem[] =>
    items.flatMap((item) =>
        item.children?.length ? item.children : [item],
    );

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const getTargetValues = (
    selected: FilterItem[],
    group: ApiTargetGroup,
): string[] =>
    unique(
        flattenSelectedItems(selected).flatMap((item) => {
          const targets = item.apiTargets?.[group];

          if (targets?.length) return targets;
          if (item.group === group) return [item.id];

          return [];
        }),
    );

const getAllowedProfileTargets = (profileTypes: string[]) => {
  const normalized = profileTypes.map((item) => item.toLowerCase());
  const hasCommunity = normalized.includes("community");
  const hasCreator = normalized.includes("creator");

  return {
    includeCommunity: !(hasCreator && !hasCommunity),
    includeCreator: !(hasCommunity && !hasCreator),
  };
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

  const profileType = selected
      .filter((item) => item.group === "profileType")
      .map((item) => item.id);

  const { includeCommunity, includeCreator } =
      getAllowedProfileTargets(profileType);

  const communityMusicGenres = includeCommunity
      ? getTargetValues(selected, "communityMusicGenres")
      : [];
  const communityThemeTopics = includeCommunity
      ? getTargetValues(selected, "communityThemeTopics")
      : [];
  const creatorMusicGenres = includeCreator
      ? getTargetValues(selected, "creatorMusicGenres")
      : [];
  const creatorContentFocus = includeCreator
      ? getTargetValues(selected, "creatorContentFocus")
      : [];

  const normalizedBudget =
      typeof budget === "number" && budget > 0 ? budget : undefined;

  const body = {
    socialMedias,
    countries,
    profileTypes: profileType,
    communityMusicGenres,
    communityThemeTopics,
    creatorMusicGenres,
    creatorContentFocus,
    ...(normalizedBudget
        ? {
          budget: normalizedBudget,
          budgetCurrency: currency,
        }
        : {}),
  };

  const key = JSON.stringify({
    socialMedias: [...socialMedias].sort(),
    countries: [...countries].sort(),
    communityMusicGenres: [...communityMusicGenres].sort(),
    communityThemeTopics: [...communityThemeTopics].sort(),
    creatorMusicGenres: [...creatorMusicGenres].sort(),
    creatorContentFocus: [...creatorContentFocus].sort(),
    profileType: [...profileType].sort(),
    filterMethod,
    budget: normalizedBudget ?? null,
    currency: normalizedBudget ? currency : null,
    sortBy,
    limit,
  });

  return useQuery({
    queryKey: ["promoAccounts", key],
    queryFn: async () => {
      const { data } = await getMultiPromoAccounts({
        body,
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
