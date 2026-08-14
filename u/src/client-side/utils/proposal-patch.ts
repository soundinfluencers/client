import type {
  CampaignContentPatchDto,
  PatchProposalAddedAccountInput,
  ProposalAddedAccountDto,
  ProposalOptionDto,
  ProposalSelectedOfferInput,
  SelectedCampaignContentItem,
  UpdateProposalCampaignRequest,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";

type MutableProposalAccount = {
  addedAccountsId?: unknown;
  accountId?: unknown;
  socialAccountId?: unknown;
  influencerId?: unknown;
  bundleId?: unknown;
  campaignBundleId?: unknown;
  bundlePosition?: unknown;
  socialMedia?: unknown;
  username?: unknown;
  selectedContent?: unknown;
  selectedCampaignContentItem?: unknown;
  dateRequest?: unknown;
};

type MutableProposalContent = {
  _id?: unknown;
  socialMedia?: unknown;
  profileType?: unknown;
  socialMediaGroup?: unknown;
  mainLink?: unknown;
  descriptions?: unknown;
  taggedUser?: unknown;
  taggedLink?: unknown;
  additionalBrief?: unknown;
};

type ProposalContentPatch = Partial<{
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  descriptions: Array<{ _id: string; description: string }>;
}>;

export type ProposalPatchFailureCode =
  | "missing_option_snapshot"
  | "duplicate_added_accounts_id"
  | "duplicate_social_account_id"
  | "missing_added_accounts_id"
  | "unknown_added_accounts_id"
  | "invalid_bundle_snapshot"
  | "partial_bundle_not_allowed"
  | "invalid_offer_snapshot"
  | "invalid_account_identity"
  | "invalid_selected_content"
  | "selected_content_not_found"
  | "invalid_campaign_content"
  | "invalid_offer_topology";

export type ProposalPatchBuildResult =
  | { ok: true; body: UpdateProposalCampaignRequest }
  | {
      ok: false;
      code: ProposalPatchFailureCode;
      message: string;
    };

type BuildProposalOptionPatchArgs = {
  campaignName: string;
  snapshot?: ProposalOptionDto;
  accounts: readonly MutableProposalAccount[];
  content: readonly MutableProposalContent[];
  patches?: Readonly<Record<string, ProposalContentPatch>>;
  pendingBundleMembership?: Readonly<Record<string, readonly string[]>>;
  selectedOfferChange?: ProposalSelectedOfferInput | null;
};

const failure = (
  code: ProposalPatchFailureCode,
  message: string,
): ProposalPatchBuildResult => ({ ok: false, code, message });

const toRequiredId = (value: unknown) => String(value ?? "").trim();

const toOptionalId = (value: unknown) => {
  const id = toRequiredId(value);
  return id || undefined;
};

const hasDuplicates = (values: readonly string[]) =>
  new Set(values).size !== values.length;

type AccountSelectionResolution =
  | { kind: "absent" }
  | { kind: "invalid" }
  | { kind: "valid"; value: SelectedCampaignContentItem };

const resolveAccountSelection = (
  account: MutableProposalAccount | ProposalAddedAccountDto,
): AccountSelectionResolution => {
  const candidates = [
    account.selectedContent,
    account.selectedCampaignContentItem,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    if (typeof candidate !== "object") return { kind: "invalid" };

    const value = candidate as Record<string, unknown>;
    const campaignContentItemId = toRequiredId(value.campaignContentItemId);
    const descriptionId = toRequiredId(value.descriptionId);

    if (campaignContentItemId && descriptionId) {
      return {
        kind: "valid",
        value: { campaignContentItemId, descriptionId },
      };
    }

    return { kind: "invalid" };
  }

  return { kind: "absent" };
};

const selectedContentEquals = (
  left?: SelectedCampaignContentItem,
  right?: SelectedCampaignContentItem,
) =>
  (left?.campaignContentItemId ?? "") ===
    (right?.campaignContentItemId ?? "") &&
  (left?.descriptionId ?? "") === (right?.descriptionId ?? "");

const mapCampaignContent = (
  content: readonly MutableProposalContent[],
  patches: Readonly<Record<string, ProposalContentPatch>>,
  persistedContentById?: ReadonlyMap<string, MutableProposalContent>,
): CampaignContentPatchDto[] | null => {
  const mapped: CampaignContentPatchDto[] = [];

  for (const item of content) {
    const id = toRequiredId(item._id);
    const socialMedia = toRequiredId(item.socialMedia).toLowerCase();
    const socialMediaGroup = toRequiredId(item.socialMediaGroup);
    if (!id || !socialMedia || !socialMediaGroup) return null;

    const patch = patches[id] ?? {};
    const persistedItem = persistedContentById?.get(id);
    const rawDescriptions = patch.descriptions ?? item.descriptions;
    if (!Array.isArray(rawDescriptions)) return null;

    const descriptions = rawDescriptions.map((description) => {
      const value = description as Record<string, unknown>;
      return {
        _id: toRequiredId(value._id),
        description: String(value.description ?? ""),
      };
    });

    if (descriptions.some((description) => !description._id)) return null;

    const profileType = toOptionalId(
      item.profileType ?? persistedItem?.profileType,
    );
    mapped.push({
      _id: id,
      socialMedia,
      ...(profileType ? { profileType } : {}),
      socialMediaGroup,
      mainLink: String(patch.mainLink ?? item.mainLink ?? ""),
      descriptions,
      taggedUser: String(patch.taggedUser ?? item.taggedUser ?? ""),
      taggedLink: String(patch.taggedLink ?? item.taggedLink ?? ""),
      additionalBrief: String(
        patch.additionalBrief ?? item.additionalBrief ?? "",
      ),
    });
  }

  return mapped;
};

const validateBundleSnapshot = (
  snapshot: ProposalOptionDto,
): ProposalPatchBuildResult | null => {
  const bundlesByCampaignId = new Map(
    snapshot.addedBundles.map((bundle) => [bundle.campaignBundleId, bundle]),
  );

  if (bundlesByCampaignId.size !== snapshot.addedBundles.length) {
    return failure(
      "invalid_bundle_snapshot",
      "Proposal contains duplicate Bundle snapshot identities.",
    );
  }

  for (const row of snapshot.addedAccounts) {
    if (!row.campaignBundleId && !row.bundleId) continue;
    if (!row.campaignBundleId || !row.bundleId) {
      return failure(
        "invalid_bundle_snapshot",
        "Proposal Bundle row has incomplete snapshot identity.",
      );
    }

    const bundle = bundlesByCampaignId.get(row.campaignBundleId);
    if (!bundle || bundle.bundleId !== row.bundleId) {
      return failure(
        "invalid_bundle_snapshot",
        "Proposal Bundle row cannot be joined to its Bundle snapshot.",
      );
    }
  }

  for (const bundle of snapshot.addedBundles) {
    const rows = snapshot.addedAccounts.filter(
      (row) => row.campaignBundleId === bundle.campaignBundleId,
    );
    if (!rows.length || rows.some((row) => row.bundleId !== bundle.bundleId)) {
      return failure(
        "invalid_bundle_snapshot",
        "Proposal Bundle snapshot has invalid account membership.",
      );
    }
  }

  return null;
};

const validateOfferSnapshot = (
  snapshot: ProposalOptionDto,
): ProposalPatchBuildResult | null => {
  const offer = snapshot.selectedOffer;
  if (!offer) return null;

  if (
    hasDuplicates(offer.selectedAccountIds) ||
    hasDuplicates(offer.selectedAddedAccountsIds) ||
    hasDuplicates(offer.overlapAccountIds)
  ) {
    return failure(
      "invalid_offer_snapshot",
      "Proposal Offer snapshot contains duplicate membership identities.",
    );
  }

  const rowsByAddedId = new Map(
    snapshot.addedAccounts.map((row) => [row.addedAccountsId, row]),
  );
  const sourceAccountIds = new Set(
    snapshot.addedAccounts.map((row) => row.socialAccountId),
  );
  const selectedSourceIds = new Set(offer.selectedAccountIds);

  const selectedRows = offer.selectedAddedAccountsIds.map((id) =>
    rowsByAddedId.get(id),
  );
  if (
    selectedRows.some((row) => !row) ||
    offer.selectedAccountIds.some((id) => !sourceAccountIds.has(id))
  ) {
    return failure(
      "invalid_offer_snapshot",
      "Proposal Offer membership references an unknown account row.",
    );
  }

  const selectedRowSourceIds = new Set(
    selectedRows.map((row) => row?.socialAccountId),
  );
  if (
    selectedRowSourceIds.size !== selectedSourceIds.size ||
    [...selectedSourceIds].some((id) => !selectedRowSourceIds.has(id))
  ) {
    return failure(
      "invalid_offer_snapshot",
      "Proposal Offer source and row memberships do not match.",
    );
  }

  for (const overlapId of offer.overlapAccountIds) {
    const overlapRow = snapshot.addedAccounts.find(
      (row) => row.socialAccountId === overlapId,
    );
    if (!selectedSourceIds.has(overlapId) || !overlapRow?.bundleId) {
      return failure(
        "invalid_offer_snapshot",
        "Proposal Offer overlap references a non-Bundle Offer account.",
      );
    }
  }

  return null;
};

export const buildProposalOptionPatchBody = ({
  campaignName,
  snapshot,
  accounts,
  content,
  patches = {},
  pendingBundleMembership = {},
  selectedOfferChange,
}: BuildProposalOptionPatchArgs): ProposalPatchBuildResult => {
  if (!snapshot) {
    return failure(
      "missing_option_snapshot",
      "The authoritative Proposal option snapshot is unavailable. Reload it before saving.",
    );
  }

  const persistedAddedIds = snapshot.addedAccounts.map(
    (row) => row.addedAccountsId,
  );
  const persistedSocialIds = snapshot.addedAccounts.map(
    (row) => row.socialAccountId,
  );
  if (hasDuplicates(persistedAddedIds)) {
    return failure(
      "duplicate_added_accounts_id",
      "The Proposal snapshot contains duplicate account row identities.",
    );
  }
  if (hasDuplicates(persistedSocialIds)) {
    return failure(
      "duplicate_social_account_id",
      "The Proposal snapshot contains duplicate social account identities.",
    );
  }

  const bundleFailure = validateBundleSnapshot(snapshot);
  if (bundleFailure) return bundleFailure;

  const offerFailure = validateOfferSnapshot(snapshot);
  if (offerFailure) return offerFailure;

  const currentAddedIds = accounts
    .map((row) => toOptionalId(row.addedAccountsId))
    .filter((id): id is string => Boolean(id));
  if (hasDuplicates(currentAddedIds)) {
    return failure(
      "duplicate_added_accounts_id",
      "The edited Proposal contains duplicate account row identities.",
    );
  }

  const currentSocialIds = accounts.map((row) =>
    toRequiredId(row.socialAccountId ?? row.accountId),
  );
  if (currentSocialIds.some((id) => !id)) {
    return failure(
      "invalid_account_identity",
      "An edited Proposal row is missing its source social account identity.",
    );
  }
  if (hasDuplicates(currentSocialIds)) {
    return failure(
      "duplicate_social_account_id",
      "The edited Proposal contains duplicate social account identities.",
    );
  }

  const currentByAddedId = new Map(
    accounts
      .map((row) => [toOptionalId(row.addedAccountsId), row] as const)
      .filter((entry): entry is readonly [string, MutableProposalAccount] =>
        Boolean(entry[0]),
      ),
  );
  const effectiveOfferAccountIds = new Set(
    selectedOfferChange === null
      ? []
      : selectedOfferChange?.selectedAccountIds ??
        snapshot.selectedOffer?.selectedAccountIds ??
        [],
  );
  for (const bundle of snapshot.addedBundles) {
    const persistedBundleRows = snapshot.addedAccounts
      .filter((row) => row.campaignBundleId === bundle.campaignBundleId)
    const currentBundleRowsCount = persistedBundleRows.filter((row) => {
      const current = currentByAddedId.get(row.addedAccountsId);
      return toOptionalId(current?.bundleId) === bundle.bundleId;
    }).length;

    if (
      currentBundleRowsCount > 0 &&
      currentBundleRowsCount < persistedBundleRows.length
    ) {
      return failure(
        "partial_bundle_not_allowed",
        "A Bundle must be saved with its full all-or-nothing membership.",
      );
    }

    if (currentBundleRowsCount === 0) {
      const retainedAsStandalone = persistedBundleRows.filter((row) => {
        const current = currentByAddedId.get(row.addedAccountsId);
        return current && !toOptionalId(current.bundleId);
      });

      if (
        retainedAsStandalone.some(
          (row) => !effectiveOfferAccountIds.has(row.socialAccountId),
        )
      ) {
        return failure(
          "partial_bundle_not_allowed",
          "Removing a Bundle cannot silently convert non-Offer members to standalone rows.",
        );
      }
    }
  }

  const persistedByAddedId = new Map(
    snapshot.addedAccounts.map((row) => [row.addedAccountsId, row]),
  );
  const persistedBySocialId = new Map(
    snapshot.addedAccounts.map((row) => [row.socialAccountId, row]),
  );
  const accountInputs: PatchProposalAddedAccountInput[] = [];
  let hasAccountValueChanges = false;

  for (const current of accounts) {
    const addedAccountsId = toOptionalId(current.addedAccountsId);
    const persisted = addedAccountsId
      ? persistedByAddedId.get(addedAccountsId)
      : undefined;
    if (addedAccountsId && !persisted) {
      return failure(
        "unknown_added_accounts_id",
        "An edited Proposal row cannot be matched to the authoritative snapshot.",
      );
    }

    const socialAccountId = toRequiredId(
      current.socialAccountId ?? current.accountId,
    );
    const currentBundleId = toOptionalId(current.bundleId);

    if (
      !socialAccountId ||
      !toRequiredId(current.influencerId) ||
      !toRequiredId(current.socialMedia)
    ) {
      return failure(
        "invalid_account_identity",
        "An edited Proposal row is missing its source social account identity.",
      );
    }

    if (!addedAccountsId && persistedBySocialId.has(socialAccountId)) {
      return failure(
        "missing_added_accounts_id",
        "An existing Proposal row lost its stable addedAccountsId.",
      );
    }

    if (
      persisted &&
      (socialAccountId !== persisted.socialAccountId ||
        toRequiredId(current.influencerId) !== persisted.influencerId ||
        toRequiredId(current.socialMedia).toLowerCase() !==
          String(persisted.socialMedia).toLowerCase())
    ) {
      return failure(
        "invalid_account_identity",
        "A persisted Proposal row changed its source account identity.",
      );
    }

    const mutableSelection = resolveAccountSelection(current);
    if (mutableSelection.kind === "invalid") {
      return failure(
        "invalid_selected_content",
        "An edited Proposal row contains an empty or malformed content selection.",
      );
    }

    const persistedSelection = persisted
      ? resolveAccountSelection(persisted)
      : { kind: "absent" as const };
    const persistedSelectedContent =
      persistedSelection.kind === "valid"
        ? persistedSelection.value
        : undefined;
    const selectedCampaignContentItem =
      mutableSelection.kind === "valid"
        ? mutableSelection.value
        : persistedSelectedContent;

    if (!selectedCampaignContentItem) {
      return failure(
        "invalid_selected_content",
        "A Proposal row has no valid current or persisted content selection.",
      );
    }

    const dateRequest = String(
      current.dateRequest ?? persisted?.dateRequest ?? "ASAP",
    );

    if (
      !persisted ||
      dateRequest !== String(persisted.dateRequest ?? "ASAP") ||
      !selectedContentEquals(
        selectedCampaignContentItem,
        persistedSelectedContent,
      )
    ) {
      hasAccountValueChanges = true;
    }

    const accountInputBase = {
      ...(currentBundleId ? { bundleId: currentBundleId } : {}),
      socialAccountId,
      influencerId: toRequiredId(current.influencerId),
      socialMedia: toRequiredId(current.socialMedia).toLowerCase(),
      username: String(current.username ?? persisted?.username ?? ""),
      selectedCampaignContentItem,
      dateRequest,
    };

    accountInputs.push(
      addedAccountsId
        ? { ...accountInputBase, addedAccountsId }
        : accountInputBase,
    );
  }

  const currentByBundleId = new Map<string, string[]>();
  accountInputs.forEach((account) => {
    if (!account.bundleId) return;
    currentByBundleId.set(account.bundleId, [
      ...(currentByBundleId.get(account.bundleId) ?? []),
      account.socialAccountId,
    ]);
  });

  const persistedBundleIds = new Set(
    snapshot.addedBundles.map((bundle) => bundle.bundleId),
  );
  for (const [bundleId, selectedAccountIds] of currentByBundleId) {
    if (persistedBundleIds.has(bundleId)) continue;

    const expectedAccountIds = pendingBundleMembership[bundleId];
    if (
      !expectedAccountIds?.length ||
      hasDuplicates(expectedAccountIds.map(String)) ||
      expectedAccountIds.length !== selectedAccountIds.length ||
      expectedAccountIds.some((id) => !selectedAccountIds.includes(String(id)))
    ) {
      return failure(
        "partial_bundle_not_allowed",
        "A new Bundle must be saved with its full all-or-nothing membership.",
      );
    }
  }

  const persistedTopology = snapshot.addedAccounts.map((row) => ({
    addedAccountsId: row.addedAccountsId,
    socialAccountId: row.socialAccountId,
    bundleId: row.bundleId,
  }));
  const currentTopology = accountInputs.map((row) => ({
    addedAccountsId: row.addedAccountsId,
    socialAccountId: row.socialAccountId,
    bundleId: row.bundleId,
  }));
  const hasAccountTopologyChanges =
    JSON.stringify(currentTopology) !== JSON.stringify(persistedTopology);

  const currentSocialAccountIds = new Set(
    accountInputs.map((account) => account.socialAccountId),
  );
  if (selectedOfferChange === undefined && snapshot.selectedOffer) {
    const missingPersistedOfferAccount =
      snapshot.selectedOffer.selectedAccountIds.some(
        (id) => !currentSocialAccountIds.has(id),
      );
    if (missingPersistedOfferAccount) {
      return failure(
        "invalid_offer_topology",
        "Removing an Offer member requires an explicit Offer topology change.",
      );
    }
  }

  if (selectedOfferChange) {
    const selectedAccountIds = selectedOfferChange.selectedAccountIds.map(String);
    if (
      !toRequiredId(selectedOfferChange.offerId) ||
      !selectedAccountIds.length ||
      hasDuplicates(selectedAccountIds) ||
      selectedAccountIds.some((id) => !currentSocialAccountIds.has(id))
    ) {
      return failure(
        "invalid_offer_topology",
        "The intended Offer membership does not match the Proposal account rows.",
      );
    }

    if (
      selectedOfferChange.selectedAddedAccountsIds &&
      (hasDuplicates(selectedOfferChange.selectedAddedAccountsIds) ||
        selectedOfferChange.selectedAddedAccountsIds.some(
          (id) => !currentAddedIds.includes(id),
        ))
    ) {
      return failure(
        "invalid_offer_topology",
        "The intended Offer row identities do not match existing Proposal rows.",
      );
    }
  }

  const persistedContentById = new Map(
    snapshot.campaignContent.map((item) => [item._id, item]),
  );
  const currentContent = mapCampaignContent(
    content,
    patches,
    persistedContentById,
  );
  const persistedContent = mapCampaignContent(snapshot.campaignContent, {});
  if (!currentContent || !persistedContent) {
    return failure(
      "invalid_campaign_content",
      "Campaign Content contains an invalid content or description identity.",
    );
  }

  const usedContentIds = new Set(
    accountInputs
      .map(
        (account) =>
          account.selectedCampaignContentItem?.campaignContentItemId ?? "",
      )
      .filter(Boolean),
  );
  const visibleCurrentContent = currentContent.filter((item) =>
    usedContentIds.has(item._id),
  );
  const persistedUsedContentIds = new Set(
    snapshot.addedAccounts
      .map((account) => {
        const selection = resolveAccountSelection(account);
        return selection.kind === "valid"
          ? selection.value.campaignContentItemId
          : "";
      })
      .filter(Boolean),
  );
  const visiblePersistedContent = persistedContent.filter((item) =>
    persistedUsedContentIds.has(item._id),
  );
  const hasContentChanges =
    JSON.stringify(visibleCurrentContent) !==
    JSON.stringify(visiblePersistedContent);

  const effectiveContent = hasContentChanges
    ? visibleCurrentContent
    : persistedContent;
  const effectiveContentById = new Map(
    effectiveContent.map((item) => [item._id, item]),
  );

  for (const account of accountInputs) {
    const selected = account.selectedCampaignContentItem;
    const selectedContent = effectiveContentById.get(
      selected.campaignContentItemId,
    );
    const hasSelectedDescription = selectedContent?.descriptions.some(
      (description) => description._id === selected.descriptionId,
    );

    if (!selectedContent || !hasSelectedDescription) {
      return failure(
        "selected_content_not_found",
        "A Proposal account selection does not exist in the effective Campaign Content.",
      );
    }
  }

  const body: UpdateProposalCampaignRequest = {
    campaignName: String(campaignName ?? ""),
  };

  if (hasContentChanges) {
    body.campaignContent = visibleCurrentContent;
  }

  if (hasAccountValueChanges || hasAccountTopologyChanges) {
    body.addedAccounts = accountInputs;
  }

  if (selectedOfferChange !== undefined) {
    body.selectedOffer = selectedOfferChange;
  }

  return { ok: true, body };
};
