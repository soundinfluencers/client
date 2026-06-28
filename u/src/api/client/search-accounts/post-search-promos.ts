import api from "@/api/api";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export type SocialMediaType =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "soundcloud"
  | "press"
  | "multipromo";

export type SearchSocialAccountsBody = {
  query: string;
  socialMedias: SocialMediaType[];
  page: number;
  limit: number;
};

export type SearchSocialAccountsResponse = {
  data: {
    accounts: IPromoCard[];
  };
  total?: number;
  page?: number;
  limit?: number;
};

const normalizePromoAccount = (account: any): IPromoCard => {
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

export const searchSocialAccounts = async (body: SearchSocialAccountsBody) => {
  const { data } = await api.post<SearchSocialAccountsResponse>(
    "/profile/social-account/search",
    body,
  );

  return {
    ...data,
    data: {
      ...data.data,
      accounts: (data.data?.accounts ?? []).map(normalizePromoAccount),
    },
  };
};
