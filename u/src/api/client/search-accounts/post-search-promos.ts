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

export const searchSocialAccounts = async (body: SearchSocialAccountsBody) => {
  const { data } = await api.post<SearchSocialAccountsResponse>(
    "/profile/social-account/search",
    body,
  );

  return data;
};
