import type { CampaignAddedAccount } from "@/types/store/index.types";

export const getUniqueSocialMedias = (accounts: CampaignAddedAccount[]) => {
  return Array.from(new Set(accounts.map((a) => a.socialMedia)));
};
