export type TSocialAccounts =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "spotify"
  | "soundcloud"
  | "press";

export interface ISocialAccountFormValues {
  accountId?: string;
  username: string;
  profileLink: string;
  followers: number | null;
  logoUrl: string;
  profileCategory: "community" | "creator";
  price: number | null;
  musicGenres: { genre: string; subGenres: string[] }[];
  categories: string[];
  creatorCategories: string[];
  countries: { country: string; percentage: number }[];
}

// Setting mode types for store and components
export type TMode = "create" | "edit";

export type TSettingMode =
  | { type: "main" }
  | {
      type: "account";
      mode: TMode;
      platform: TSocialAccounts;
      account?: ISocialAccountFormValues;
      accountId?: number;
    };

// Form configuration types
type TPlatformConfig = {
  switcher: boolean;
  musicGenres: boolean;
  themeTopics: boolean;
  audienceInsights: boolean;
};

export type TPlatformConfigRecord = Record<TSocialAccounts, TPlatformConfig>;
