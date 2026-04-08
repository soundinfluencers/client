import type { CampaignAddedAccount } from "@/types/store/index.types";

export const getAccountKey = (a: CampaignAddedAccount | any) =>
    String(
        (a as any).addedAccountsId ??
        (a as any).socialAccountId ??
        (a as any).accountId ??
        (a as any)._id ??
        "",
);
