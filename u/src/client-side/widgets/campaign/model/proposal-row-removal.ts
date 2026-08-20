type ProposalTopologyAccount = {
  socialAccountId?: unknown;
  accountId?: unknown;
  addedAccountsId?: unknown;
  _id?: unknown;
  bundleId?: unknown;
};

type ProposalOfferMembership = {
  selectedAccountIds?: readonly unknown[];
} | null;

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
  toIdentity(
    account.addedAccountsId ??
      account.accountId ??
      account.socialAccountId ??
      account._id,
  );

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

  const targetBundleId = toIdentity(target.bundleId);
  const targetSocialAccountId = getSocialAccountId(target);
  const offerAccountIds = new Set(
    (selectedOffer?.selectedAccountIds ?? [])
      .map(toIdentity)
      .filter(Boolean),
  );
  const removesOffer =
    !targetBundleId &&
    Boolean(targetSocialAccountId) &&
    offerAccountIds.has(targetSocialAccountId);
  const removalKind: ProposalRowRemovalKind = targetBundleId
    ? "bundle"
    : removesOffer
      ? "offer"
      : "standalone";

  const remainingAccountsCount = accounts.filter((account) => {
    const accountBundleId = toIdentity(account.bundleId);
    const socialAccountId = getSocialAccountId(account);

    if (targetBundleId) {
      return (
        accountBundleId !== targetBundleId || offerAccountIds.has(socialAccountId)
      );
    }

    if (removesOffer) {
      return !offerAccountIds.has(socialAccountId) || Boolean(accountBundleId);
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
  optionIndexes,
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

  return new Set(optionIndexes).size > 1
    ? { kind: "delete_option", ...result }
    : { kind: "block_last_option", ...result };
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
