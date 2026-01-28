import type { TSocialAccounts } from "@/types/user/influencer.types";

export const qk = {
  influencerProfile: ["influencer-profile"] as const,
  socialAccounts: (platform: TSocialAccounts, accountId: string) =>
    ["social-account", platform, accountId] as const,
};
