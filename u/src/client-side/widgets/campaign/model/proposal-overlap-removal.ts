type ProposalTopologyAccount = {
  socialAccountId?: unknown;
  addedAccountsId?: unknown;
  bundleId?: unknown;
};

type ProposalOfferMembership = {
  selectedAccountIds?: readonly unknown[];
  selectedAddedAccountsIds?: readonly unknown[];
} | null;

export type FullOfferBundleOverlap = {
  bundleId: string;
  socialAccountIds: string[];
};

export type ProposalOverlapRemovalDecision =
  | { kind: "not_full_overlap" }
  | {
      kind: "remove_packages" | "delete_option" | "block_last_option";
      overlap: FullOfferBundleOverlap;
    };

const toIdentity = (value: unknown): string => String(value ?? "").trim();

export const getProposalSocialAccountId = (
  account: ProposalTopologyAccount,
): string => toIdentity(account.socialAccountId);

const setsEqual = (left: Set<string>, right: Set<string>): boolean => {
  if (left.size !== right.size) return false;

  return Array.from(left).every((identity) => right.has(identity));
};

export const resolveOfferSocialAccountIds = ({
  accounts,
  selectedOffer,
}: {
  accounts: readonly ProposalTopologyAccount[];
  selectedOffer: ProposalOfferMembership;
}): Set<string> | null => {
  if (!selectedOffer) return null;

  const selectedAccountIds = new Set(
    (selectedOffer.selectedAccountIds ?? [])
      .map(toIdentity)
      .filter(Boolean),
  );
  const selectedAddedAccountsIds = (selectedOffer.selectedAddedAccountsIds ?? [])
    .map(toIdentity)
    .filter(Boolean);

  if (!selectedAddedAccountsIds.length) {
    return selectedAccountIds.size ? selectedAccountIds : null;
  }

  const socialAccountIdByAddedAccountId = new Map<string, string>();

  for (const account of accounts) {
    const addedAccountsId = toIdentity(account.addedAccountsId);
    const socialAccountId = getProposalSocialAccountId(account);

    if (!addedAccountsId || !socialAccountId) continue;
    if (socialAccountIdByAddedAccountId.has(addedAccountsId)) return null;

    socialAccountIdByAddedAccountId.set(addedAccountsId, socialAccountId);
  }

  const resolvedFromLifecycleIds = new Set<string>();

  for (const addedAccountsId of selectedAddedAccountsIds) {
    const socialAccountId = socialAccountIdByAddedAccountId.get(addedAccountsId);
    if (!socialAccountId) return null;
    resolvedFromLifecycleIds.add(socialAccountId);
  }

  if (!selectedAccountIds.size) return resolvedFromLifecycleIds;

  return setsEqual(selectedAccountIds, resolvedFromLifecycleIds)
    ? selectedAccountIds
    : null;
};

export const getFullOfferBundleOverlap = ({
  targetAccount,
  accounts,
  selectedOffer,
}: {
  targetAccount: ProposalTopologyAccount;
  accounts: readonly ProposalTopologyAccount[];
  selectedOffer: ProposalOfferMembership;
}): FullOfferBundleOverlap | null => {
  const targetSocialAccountId = getProposalSocialAccountId(targetAccount);
  const bundleId = toIdentity(targetAccount.bundleId);

  if (!targetSocialAccountId || !bundleId) return null;

  const bundleAccountIds = new Set<string>();

  for (const account of accounts) {
    if (toIdentity(account.bundleId) !== bundleId) continue;

    const socialAccountId = getProposalSocialAccountId(account);
    if (!socialAccountId) return null;
    bundleAccountIds.add(socialAccountId);
  }

  const offerAccountIds = resolveOfferSocialAccountIds({
    accounts,
    selectedOffer,
  });

  if (
    !bundleAccountIds.size ||
    !offerAccountIds?.size ||
    !bundleAccountIds.has(targetSocialAccountId) ||
    !offerAccountIds.has(targetSocialAccountId) ||
    !setsEqual(bundleAccountIds, offerAccountIds)
  ) {
    return null;
  }

  return {
    bundleId,
    socialAccountIds: Array.from(bundleAccountIds),
  };
};

export const decideProposalOverlapRemoval = ({
  targetAccount,
  accounts,
  selectedOffer,
  optionIndexes,
}: {
  targetAccount: ProposalTopologyAccount;
  accounts: readonly ProposalTopologyAccount[];
  selectedOffer: ProposalOfferMembership;
  optionIndexes: readonly number[];
}): ProposalOverlapRemovalDecision => {
  const overlap = getFullOfferBundleOverlap({
    targetAccount,
    accounts,
    selectedOffer,
  });

  if (!overlap) return { kind: "not_full_overlap" };

  const removedSocialAccountIds = new Set(overlap.socialAccountIds);
  const hasRemainingAccounts = accounts.some(
    (account) =>
      !removedSocialAccountIds.has(getProposalSocialAccountId(account)),
  );

  if (hasRemainingAccounts) return { kind: "remove_packages", overlap };

  const uniqueOptionIndexes = new Set(optionIndexes);

  return uniqueOptionIndexes.size > 1
    ? { kind: "delete_option", overlap }
    : { kind: "block_last_option", overlap };
};

export const removeFullOverlapAccounts = <T extends ProposalTopologyAccount>(
  accounts: readonly T[],
  overlap: FullOfferBundleOverlap,
): T[] => {
  const removedSocialAccountIds = new Set(overlap.socialAccountIds);

  return accounts.filter(
    (account) =>
      !removedSocialAccountIds.has(getProposalSocialAccountId(account)),
  );
};
