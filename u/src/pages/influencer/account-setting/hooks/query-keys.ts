import type { TSocialAccounts } from "@/types/user/influencer.types";

export const qk = {
  influencerProfile: ["influencerProfile"] as const,
  socialAccounts: (platform: TSocialAccounts, accountId: string) =>
    ["socialAccount", platform, accountId] as const,
};
