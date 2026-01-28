import api from "@/api/api";

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

export type SocialAccount = {
  _id: string;
  username: string;
  socialMedia: SocialMediaType;
  logoUrl?: string;
  followers?: number;
};

export type SearchSocialAccountsResponse = {
  data: {
    accounts: SocialAccount[];
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
  console.log(data, "seacrhg");
  return data;
};
