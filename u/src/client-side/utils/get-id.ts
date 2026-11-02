import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getProposalWorkingRowKey } from "./proposal-option-patch";

export const getAccountKey = (a: CampaignAddedAccount | any) =>
    String(
        getProposalWorkingRowKey(a) || (
        (a as any).addedAccountsId ??
        (a as any).socialAccountId ??
        (a as any).accountId ??
        (a as any)._id ??
        ""),
);
