import $api from "../../api";
import type { MultiPromoAccountsBody } from "./types";

const normalizePromoAccount = (account: any) => {
  const communityMusicGenres = Array.isArray(account?.communityMusicGenres)
    ? account.communityMusicGenres
    : [];
  const creatorMusicGenres = Array.isArray(account?.creatorMusicGenres)
    ? account.creatorMusicGenres
    : [];
  const communityThemeTopics = Array.isArray(account?.communityThemeTopics)
    ? account.communityThemeTopics
    : [];
  const creatorContentFocus = Array.isArray(account?.creatorContentFocus)
    ? account.creatorContentFocus
    : [];

  return {
    ...account,
    communityMusicGenres,
    communityThemeTopics,
    creatorMusicGenres,
    creatorContentFocus,
    musicGenres: Array.isArray(account?.musicGenres)
      ? account.musicGenres
      : [...communityMusicGenres, ...creatorMusicGenres],
    categories: Array.isArray(account?.categories)
      ? account.categories
      : [...communityThemeTopics, ...creatorContentFocus],
    creatorCategories: Array.isArray(account?.creatorCategories)
      ? account.creatorCategories
      : [],
  };
};

export const getMultiPromoAccounts = async ({
  sortBy = "bestMatch",
  limit,
  page = 1,
  body,
}: {
  sortBy?: string;
  limit?: number;
  page?: number;
  body: MultiPromoAccountsBody;
}) => {
  const response = await $api.post(`/profile/social-account/filter`, body, {
    params: {
      sortBy,
      limit,
      page,
    },
  });

  return {
    ...response.data,
    data: {
      ...response.data?.data,
      accounts: (response.data?.data?.accounts ?? []).map(normalizePromoAccount),
    },
  };
};
