import type {
  ProposalOptionDto,
  ProposalSelectedOfferInput,
  SelectedCampaignContentItem,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import {
  mapCampaignContent,
  resolveAccountSelection,
  type MutableProposalAccount,
  type MutableProposalContent,
  type ProposalContentPatch,
} from "../../../utils/proposal-patch.ts";

type ComparableAccount = {
  socialAccountId: string;
  addedAccountsId: string | null;
  influencerId: string;
  socialMedia: string;
  dateRequest: string;
  contentSelection: SelectedCampaignContentItem | null;
};

type ComparableBundle = {
  bundleId: string;
  accountIds: string[];
};

type ComparableOffer = {
  offerId: string;
  accountIds: string[];
} | null;

type ComparableContent = {
  id: string;
  socialMedia: string;
  profileType: string | null;
  socialMediaGroup: string;
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: Array<{
    id: string;
    additionalBrief: string;
  }>;
  descriptions: Array<{
    id: string;
    description: string;
  }>;
};

export type ComparableProposalOption = {
  accounts: ComparableAccount[];
  bundles: ComparableBundle[];
  offer: ComparableOffer;
  content: ComparableContent[];
  issues: string[];
};

export type ProposalOptionDirtyInput = {
  snapshot?: ProposalOptionDto;
  accounts: readonly MutableProposalAccount[];
  content: readonly MutableProposalContent[];
  patches?: Readonly<Record<string, ProposalContentPatch>>;
  pendingBundleMembership?: Readonly<Record<string, readonly string[]>>;
  selectedOfferChange?: ProposalSelectedOfferInput | null;
};

export type ProposalOptionSwitchIntent =
  | { kind: "no_op" }
  | { kind: "switch"; targetOptionIndex: number }
  | { kind: "confirm"; targetOptionIndex: number };

const requiredId = (value: unknown) => String(value ?? "").trim();

const optionalId = (value: unknown) => requiredId(value) || null;

const sortedUniqueIds = (values: readonly unknown[]) =>
  Array.from(new Set(values.map(requiredId).filter(Boolean))).sort();

const selectionValue = (
  account: MutableProposalAccount,
  persisted: MutableProposalAccount | undefined,
  issues: string[],
  identity: string,
): SelectedCampaignContentItem | null => {
  const current = resolveAccountSelection(account);

  if (current.kind === "valid") return current.value;
  if (current.kind === "invalid") {
    issues.push(`invalid-current-content:${identity}`);
    return null;
  }

  if (persisted) {
    const persistedSelection = resolveAccountSelection(persisted);
    if (persistedSelection.kind === "valid") return persistedSelection.value;
    issues.push(`invalid-persisted-content:${identity}`);
    return null;
  }

  issues.push(`missing-current-content:${identity}`);
  return null;
};

const projectContent = (
  content: readonly MutableProposalContent[],
  patches: Readonly<Record<string, ProposalContentPatch>>,
  selectedContentIds: ReadonlySet<string>,
  issues: string[],
  persistedContent?: readonly MutableProposalContent[],
): ComparableContent[] => {
  const persistedById = persistedContent
    ? new Map(
      persistedContent.map((item) => [requiredId(item._id), item]),
    )
    : undefined;
  const mapped = mapCampaignContent(content, patches, persistedById);

  if (!mapped) {
    issues.push("invalid-campaign-content");
    return [];
  }

  const mappedIds = new Set(mapped.map((item) => item._id));

  selectedContentIds.forEach((id) => {
    if (!mappedIds.has(id)) issues.push(`selected-content-missing:${id}`);
  });

  return mapped.map((item) => ({
    id: item._id,
    socialMedia: item.socialMedia.toLowerCase(),
    profileType: item.profileType ?? null,
    socialMediaGroup: item.socialMediaGroup,
    mainLink: item.mainLink ?? "",
    taggedUser: item.taggedUser ?? "",
    taggedLink: item.taggedLink ?? "",
    additionalBrief: item.additionalBrief.map((brief) => ({
      id: brief._id,
      additionalBrief: brief.additionalBrief,
    })),
    descriptions: item.descriptions.map((description) => ({
      id: description._id,
      description: description.description ?? "",
    })),
  }));
};

const withEffectiveBriefSelections = (
  accounts: ComparableAccount[],
  content: readonly ComparableContent[],
) => {
  const contentById = new Map(content.map((item) => [item.id, item]));

  return accounts.map((account) => {
    const selection = account.contentSelection;
    if (!selection) return account;

    const selectedContent = contentById.get(selection.campaignContentItemId);
    const selectedBriefId = selection.additionalBriefId ?? "";
    const additionalBriefId =
      selectedContent?.additionalBrief.find(
        (brief) => brief.id === selectedBriefId,
      )?.id ?? selectedContent?.additionalBrief[0]?.id;

    return {
      ...account,
      contentSelection: {
        campaignContentItemId: selection.campaignContentItemId,
        descriptionId: selection.descriptionId,
        ...(additionalBriefId ? { additionalBriefId } : {}),
      },
    };
  });
};

const projectBundles = (
  accounts: readonly MutableProposalAccount[],
): ComparableBundle[] => {
  const membersByBundle = new Map<string, string[]>();

  accounts.forEach((account) => {
    const bundleId = requiredId(account.bundleId);
    const accountId = requiredId(account.socialAccountId ?? account.accountId);
    if (!bundleId || !accountId) return;

    membersByBundle.set(bundleId, [
      ...(membersByBundle.get(bundleId) ?? []),
      accountId,
    ]);
  });

  return Array.from(membersByBundle.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([bundleId, accountIds]) => ({
      bundleId,
      accountIds: sortedUniqueIds(accountIds),
    }));
};

const projectOffer = (
  offer: ProposalSelectedOfferInput | null | undefined,
): ComparableOffer => {
  if (!offer) return null;

  return {
    offerId: requiredId(offer.offerId),
    accountIds: sortedUniqueIds(offer.selectedAccountIds),
  };
};

const projectAccounts = ({
  accounts,
  persistedAccounts,
  issues,
}: {
  accounts: readonly MutableProposalAccount[];
  persistedAccounts?: readonly MutableProposalAccount[];
  issues: string[];
}): ComparableAccount[] => {
  const persistedByAddedId = new Map(
    (persistedAccounts ?? [])
      .map((account) => [optionalId(account.addedAccountsId), account] as const)
      .filter(
        (entry): entry is readonly [string, MutableProposalAccount] =>
          Boolean(entry[0]),
      ),
  );
  const persistedBySocialId = new Map(
    (persistedAccounts ?? []).map((account) => [
      requiredId(account.socialAccountId ?? account.accountId),
      account,
    ]),
  );
  const seenSocialIds = new Set<string>();
  const seenAddedIds = new Set<string>();

  return accounts
    .map((account) => {
      const socialAccountId = requiredId(
        account.socialAccountId ?? account.accountId,
      );
      const addedAccountsId = optionalId(account.addedAccountsId);
      const identity = socialAccountId || addedAccountsId || "missing";
      const persisted = addedAccountsId
        ? persistedByAddedId.get(addedAccountsId)
        : undefined;

      if (!socialAccountId) issues.push("missing-social-account-id");
      if (socialAccountId && seenSocialIds.has(socialAccountId)) {
        issues.push(`duplicate-social-account-id:${socialAccountId}`);
      }
      if (socialAccountId) seenSocialIds.add(socialAccountId);

      if (addedAccountsId && seenAddedIds.has(addedAccountsId)) {
        issues.push(`duplicate-added-account-id:${addedAccountsId}`);
      }
      if (addedAccountsId) seenAddedIds.add(addedAccountsId);

      if (addedAccountsId && persistedAccounts && !persisted) {
        issues.push(`unknown-added-account-id:${addedAccountsId}`);
      }
      if (
        !addedAccountsId &&
        persistedAccounts &&
        persistedBySocialId.has(socialAccountId)
      ) {
        issues.push(`missing-added-account-id:${socialAccountId}`);
      }

      const contentSelection = selectionValue(
        account,
        persisted,
        issues,
        identity,
      );

      return {
        socialAccountId,
        addedAccountsId,
        influencerId: requiredId(account.influencerId),
        socialMedia: requiredId(account.socialMedia).toLowerCase(),
        dateRequest: String(
          account.dateRequest ?? persisted?.dateRequest ?? "ASAP",
        ),
        contentSelection,
      };
    })
    .sort((left, right) =>
      left.socialAccountId.localeCompare(right.socialAccountId),
    );
};

const validateNewBundleMembership = ({
  snapshot,
  bundles,
  pendingBundleMembership,
  issues,
}: {
  snapshot: ProposalOptionDto;
  bundles: readonly ComparableBundle[];
  pendingBundleMembership: Readonly<Record<string, readonly string[]>>;
  issues: string[];
}) => {
  const persistedBundleIds = new Set(
    snapshot.addedBundles.map((bundle) => requiredId(bundle.bundleId)),
  );

  bundles.forEach((bundle) => {
    if (persistedBundleIds.has(bundle.bundleId)) return;

    const pending = sortedUniqueIds(
      pendingBundleMembership[bundle.bundleId] ?? [],
    );
    if (JSON.stringify(pending) !== JSON.stringify(bundle.accountIds)) {
      issues.push(`invalid-new-bundle-membership:${bundle.bundleId}`);
    }
  });
};

const validateOffer = ({
  offer,
  accounts,
  selectedOfferChange,
  issues,
}: {
  offer: ComparableOffer;
  accounts: readonly ComparableAccount[];
  selectedOfferChange?: ProposalSelectedOfferInput | null;
  issues: string[];
}) => {
  if (!offer) return;

  const accountIds = new Set(accounts.map((account) => account.socialAccountId));
  if (
    !offer.offerId ||
    !offer.accountIds.length ||
    offer.accountIds.some((id) => !accountIds.has(id))
  ) {
    issues.push("invalid-offer-topology");
  }

  if (selectedOfferChange?.selectedAddedAccountsIds) {
    const addedIds = new Set(
      accounts
        .map((account) => account.addedAccountsId)
        .filter((id): id is string => Boolean(id)),
    );
    if (
      selectedOfferChange.selectedAddedAccountsIds.some(
        (id) => !addedIds.has(requiredId(id)),
      )
    ) {
      issues.push("invalid-offer-row-identities");
    }
  }
};

export const buildAuthoritativeProposalOptionProjection = (
  snapshot: ProposalOptionDto,
): ComparableProposalOption => {
  const issues: string[] = [];
  const accounts = projectAccounts({
    accounts: snapshot.addedAccounts,
    issues,
  });
  const selectedContentIds = new Set(
    accounts
      .map((account) => account.contentSelection?.campaignContentItemId ?? "")
      .filter(Boolean),
  );
  const offer = projectOffer(snapshot.selectedOffer ?? null);
  const projectedContent = projectContent(
    snapshot.campaignContent,
    {},
    selectedContentIds,
    issues,
  );
  const effectiveAccounts = withEffectiveBriefSelections(
    accounts,
    projectedContent,
  );

  validateOffer({ offer, accounts: effectiveAccounts, issues });

  return {
    accounts: effectiveAccounts,
    bundles: projectBundles(snapshot.addedAccounts),
    offer,
    content: projectedContent,
    issues: issues.sort(),
  };
};

export const buildWorkingProposalOptionProjection = ({
  snapshot,
  accounts: rawAccounts,
  content,
  patches = {},
  pendingBundleMembership = {},
  selectedOfferChange,
}: ProposalOptionDirtyInput): ComparableProposalOption | null => {
  if (!snapshot) return null;

  const issues: string[] = [];
  const accounts = projectAccounts({
    accounts: rawAccounts,
    persistedAccounts: snapshot.addedAccounts,
    issues,
  });
  const bundles = projectBundles(rawAccounts);
  const offer = projectOffer(
    selectedOfferChange === undefined
      ? snapshot.selectedOffer ?? null
      : selectedOfferChange,
  );
  const selectedContentIds = new Set(
    accounts
      .map((account) => account.contentSelection?.campaignContentItemId ?? "")
      .filter(Boolean),
  );

  const projectedContent = projectContent(
    content,
    patches,
    selectedContentIds,
    issues,
    snapshot.campaignContent,
  );
  const effectiveAccounts = withEffectiveBriefSelections(
    accounts,
    projectedContent,
  );

  validateNewBundleMembership({
    snapshot,
    bundles,
    pendingBundleMembership,
    issues,
  });
  validateOffer({
    offer,
    accounts: effectiveAccounts,
    selectedOfferChange,
    issues,
  });

  return {
    accounts: effectiveAccounts,
    bundles,
    offer,
    content: projectedContent,
    issues: issues.sort(),
  };
};

export const isProposalOptionDirty = (
  input: ProposalOptionDirtyInput,
): boolean => {
  if (!input.snapshot) return true;

  const authoritative = buildAuthoritativeProposalOptionProjection(
    input.snapshot,
  );
  const working = buildWorkingProposalOptionProjection(input);

  return JSON.stringify(authoritative) !== JSON.stringify(working);
};

export const decideProposalOptionSwitchIntent = ({
  activeOptionIndex,
  targetOptionIndex,
  isDirty,
}: {
  activeOptionIndex: number;
  targetOptionIndex: number;
  isDirty: boolean;
}): ProposalOptionSwitchIntent => {
  if (activeOptionIndex === targetOptionIndex) return { kind: "no_op" };

  return isDirty
    ? { kind: "confirm", targetOptionIndex }
    : { kind: "switch", targetOptionIndex };
};

export const saveBeforeProposalOptionSwitch = async ({
  targetOptionIndex,
  saveCurrentOption,
  switchOption,
}: {
  targetOptionIndex: number;
  saveCurrentOption: () => Promise<boolean>;
  switchOption: (optionIndex: number) => Promise<void>;
}) => {
  const saved = await saveCurrentOption();
  if (!saved) return false;

  await switchOption(targetOptionIndex);
  return true;
};

export const discardBeforeProposalOptionSwitch = async ({
  targetOptionIndex,
  resetHistoricalState,
  restoreCurrentOption,
  switchOption,
}: {
  targetOptionIndex: number;
  resetHistoricalState: () => void;
  restoreCurrentOption: () => boolean;
  switchOption: (optionIndex: number) => Promise<void>;
}) => {
  resetHistoricalState();
  if (!restoreCurrentOption()) return false;

  await switchOption(targetOptionIndex);
  return true;
};
