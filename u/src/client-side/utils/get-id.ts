import type { CampaignAddedAccount } from "@/types/store/index.types";

export const getAccountKey = (a: CampaignAddedAccount | any) =>
  String(
    a?.addedAccountsId ?? a?._id ?? a?.socialAccountId ?? a?.accountId ?? a?.id,
  );
