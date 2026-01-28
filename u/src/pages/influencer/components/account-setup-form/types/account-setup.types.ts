import type {
  SocialAccountDraft,
  TSocialAccounts,
} from "@/types/user/influencer.types";

// Form values type
export type TSocialAccountFormValues = SocialAccountDraft;

// Setting mode types for store and components
export type TSettingMode =
  | { type: "main"; platform?: TSocialAccounts; accountIdentifier?: string }
  | {
      type: "account";
      platform: TSocialAccounts;
      accountIdentifier?: string;
    };

// Form configuration types (for different platforms)
type TPlatformConfig = {
  switcher: boolean;
  musicGenres: boolean;
  themeTopics: boolean;
  audienceInsights: boolean;
};
export type TPlatformConfigRecord = Record<TSocialAccounts, TPlatformConfig>;
