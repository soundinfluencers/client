import type {
  TSocialAccounts,
  ISignupInfluencerDraft,
  TSocialAccountShort,
} from "@/types/user/influencer.types";

export const signupAccountsForList = (
  platform: TSocialAccounts,
  user: ISignupInfluencerDraft,
): Pick<TSocialAccountShort, "username">[] => {
  return user[platform].map((account) => ({
    username: account.username,
  }));
};
