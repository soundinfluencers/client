import type { TSocialAccounts, ISignupInfluencerDraft, TSocialAccountShort } from "@/types/user/influencer.types";

export const signupAccountsForList = (
  platform: TSocialAccounts,
  user: ISignupInfluencerDraft,
): TSocialAccountShort[] => {
  return user[platform].map((account) => ({
    username: account.username,
  }));
};
