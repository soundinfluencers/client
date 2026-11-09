type ProposalTopologyAccount = {
  socialAccountId?: unknown;
  accountId?: unknown;
  addedAccountsId?: unknown;
  _id?: unknown;
  campaignBundleId?: unknown;
  bundleId?: unknown;
};

type ProposalOfferMembership = {
  selectedAddedAccountsIds?: readonly unknown[];
  selectedAccountIds?: readonly unknown[];
} | null;

export const LAST_PLACEMENT_MESSAGE = "Add another placement before removing this selection. A Proposal option cannot be saved without placements.";

export type ProposalRowRemovalKind = "standalone" | "offer" | "bundle";

export type ProposalRowRemovalDecision =
  | { kind: "not_removable" }
  | {
      kind: "keep_option" | "delete_option" | "block_last_option";
      removalKind: ProposalRowRemovalKind;
      remainingAccountsCount: number;
    };

type ProposalRowRemovalHandlers = {
  onKeepOption: () => void;
  onDeleteOption: () => Promise<void>;
  onBlockLastOption: () => void;
};

const toIdentity = (value: unknown): string => String(value ?? "").trim();

const getSocialAccountId = (account: ProposalTopologyAccount): string =>
  toIdentity(account.socialAccountId ?? account.accountId);

const getAccountKey = (account: ProposalTopologyAccount): string =>
  getProposalWorkingRowKey(account);

const getRemovalResult = ({
  targetAccount,
  accounts,
  selectedOffer,
}: {
  targetAccount: ProposalTopologyAccount;
  accounts: readonly ProposalTopologyAccount[];
  selectedOffer: ProposalOfferMembership;
}): {
  removalKind: ProposalRowRemovalKind;
  remainingAccountsCount: number;
} | null => {
  const targetKey = getAccountKey(targetAccount);
  const target = accounts.find(
    (account) => getAccountKey(account) === targetKey,
  );

  if (!targetKey || !target) return null;

  const targetBundleId = toIdentity(target.campaignBundleId ?? target.bundleId);
  const targetSocialAccountId = getSocialAccountId(target);
  const offerAccountIds = new Set(
    (selectedOffer?.selectedAccountIds ?? [])
      .map(toIdentity)
      .filter(Boolean),
  );
  const selectedRows = new Set((selectedOffer?.selectedAddedAccountsIds ?? []).map(toIdentity));
  const inOffer = (account: ProposalTopologyAccount) => selectedRows.size ? selectedRows.has(getAccountKey(account)) : offerAccountIds.has(getSocialAccountId(account));
  const removesOffer =
    !targetBundleId &&
    Boolean(targetSocialAccountId) &&
    inOffer(target);
  const removalKind: ProposalRowRemovalKind = targetBundleId
    ? "bundle"
    : removesOffer
      ? "offer"
      : "standalone";

  const remainingAccountsCount = accounts.filter((account) => {
    const accountBundleId = toIdentity(account.campaignBundleId ?? account.bundleId);
  
    if (targetBundleId) {
      return (
        accountBundleId !== targetBundleId || inOffer(account)
      );
    }

    if (removesOffer) {
      return !inOffer(account) || Boolean(accountBundleId);
    }

    return getAccountKey(account) !== targetKey;
  }).length;

  if (remainingAccountsCount === accounts.length) return null;

  return { removalKind, remainingAccountsCount };
};

export const decideProposalRowRemoval = ({
  targetAccount,
  accounts,
  selectedOffer,
}: {
  targetAccount: ProposalTopologyAccount;
  accounts: readonly ProposalTopologyAccount[];
  selectedOffer: ProposalOfferMembership;
  optionIndexes: readonly number[];
}): ProposalRowRemovalDecision => {
  const result = getRemovalResult({ targetAccount, accounts, selectedOffer });

  if (!result) return { kind: "not_removable" };
  if (result.remainingAccountsCount > 0) {
    return { kind: "keep_option", ...result };
  }

  return { kind: "block_last_option", ...result };
};

export const executeProposalRowRemovalDecision = async (
  decision: ProposalRowRemovalDecision,
  handlers: ProposalRowRemovalHandlers,
): Promise<void> => {
  switch (decision.kind) {
    case "keep_option":
      handlers.onKeepOption();
      return;
    case "delete_option":
      await handlers.onDeleteOption();
      return;
    case "block_last_option":
      handlers.onBlockLastOption();
      return;
    case "not_removable":
      return;
  }
};
import { getProposalWorkingRowKey } from "@/client-side/utils/proposal-option-patch";
