import type {
    CampaignDraftAccountGetDto,
    CampaignDraftGetDto,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import {
    mapDraftAccountToSelectedAccount,
    mapDraftContentToCampaignContent,
    mapDraftStepToBuilderStep,
} from "@/entities/client-side/campaign-draft/model/campaign-draft.mappers";
import type {
    HydratedCampaignBuilderDraftState,
    SelectedBundleSnapshot,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import type {
    Bundle,
} from "@/entities/client-side/campaign-creator-page/bundle";
import type {
    PublishedOffer,
} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types";
import { useCampaignBuilderStore } from "./campaign-builder.store";
import {
    isCampaignSelectionPricingAvailable,
    mapOfferAccountToSelectedAccount,
    normalizeSelectedAccounts,
} from "./campaign-builder-selection";
import { calcBuilderTotal } from "./calc-builder-total";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";
import { isMongoId } from "@/store/client/create-campaign/utils/oid";

const UNSUPPORTED_DRAFT_MESSAGE =
    "This draft cannot be safely opened in the current Campaign Builder.";

export type CampaignDraftHydrationErrorCode =
    | "draft_invalid_step"
    | "draft_invalid_currency"
    | "draft_invalid_social_media"
    | "draft_invalid_account_identity"
    | "draft_invalid_selection_id"
    | "draft_duplicate_selection_id"
    | "draft_invalid_account_social_media"
    | "draft_invalid_price_map"
    | "draft_invalid_source_fields"
    | "draft_unavailable_selection"
    | "draft_unsupported_topology"
    | "draft_divergent_workflow_values"
    | "draft_invalid_content_reference"
    | "draft_bundle_membership_mismatch"
    | "draft_bundle_enrichment_failed"
    | "draft_bundle_enrichment_mismatch"
    | "draft_offer_membership_mismatch"
    | "draft_offer_enrichment_failed"
    | "draft_offer_enrichment_mismatch"
    | "draft_missing_currency_price"
    | "draft_invalid_total"
    | "draft_mapping_failed";

export class CampaignDraftHydrationError extends Error {
    readonly code: CampaignDraftHydrationErrorCode;
    readonly details?: Record<string, unknown>;

    constructor(
        code: CampaignDraftHydrationErrorCode,
        details?: Record<string, unknown>,
    ) {
        super(UNSUPPORTED_DRAFT_MESSAGE);
        this.name = "CampaignDraftHydrationError";
        this.code = code;
        this.details = details;
    }
}

const failHydration = (
    code: CampaignDraftHydrationErrorCode,
    details?: Record<string, unknown>,
): never => {
    throw new CampaignDraftHydrationError(code, details);
};

const assert: (
    condition: unknown,
    code: CampaignDraftHydrationErrorCode,
    details?: Record<string, unknown>,
) => asserts condition = (condition, code, details) => {
    if (!condition) failHydration(code, details);
};

const isSupportedStep = (
    value: string,
): value is CampaignDraftGetDto["step"] =>
    value === "addAccounts" ||
    value === "addContent" ||
    value === "strategyTable";

const isSupportedCurrency = (
    value: string,
): value is CampaignDraftGetDto["displayCurrency"] =>
    value === "EUR" || value === "USD" || value === "GBP";

const isSupportedSocialMedia = (value: string): boolean =>
    value === "instagram" ||
    value === "facebook" ||
    value === "tiktok" ||
    value === "youtube" ||
    value === "spotify" ||
    value === "soundcloud" ||
    value === "press";

const isPriceMap = (value: unknown): boolean =>
    typeof value === "object" && value !== null;

const isKnownProfileType = (
    value: string | undefined,
): value is "creator" | "community" =>
    value === "creator" || value === "community";

const hasUniqueStrings = (values: readonly string[]): boolean =>
    new Set(values).size === values.length;

const haveSameStringSet = (
    left: readonly string[],
    right: readonly string[],
): boolean =>
    left.length === right.length &&
    hasUniqueStrings(left) &&
    hasUniqueStrings(right) &&
    left.every((value) => right.includes(value));

const getWorkflowKey = (account: CampaignDraftAccountGetDto): string => {
    const reference = account.selectedCampaignContentItem;

    return JSON.stringify({
        dateRequest: account.dateRequest || "ASAP",
        campaignContentItemId: reference?.campaignContentItemId ?? null,
        descriptionId: reference?.descriptionId ?? null,
        additionalBriefId: reference?.additionalBriefId ?? null,
    });
};

const groupAccountsById = (
    accounts: readonly CampaignDraftAccountGetDto[],
): Map<string, CampaignDraftAccountGetDto[]> => {
    const groups = new Map<string, CampaignDraftAccountGetDto[]>();

    accounts.forEach((account) => {
        const group = groups.get(account.socialAccountId) ?? [];
        group.push(account);
        groups.set(account.socialAccountId, group);
    });

    return groups;
};

const validateSourceRow = (account: CampaignDraftAccountGetDto): void => {
    const accountDetails = {
        selectionId: account.selectionId,
        socialAccountId: account.socialAccountId,
        source: account.source,
    };

    assert(
        isMongoId(account.selectionId),
        "draft_invalid_selection_id",
        accountDetails,
    );
    assert(
        Boolean(account.socialAccountId) && Boolean(account.influencerId),
        "draft_invalid_account_identity",
        accountDetails,
    );
    assert(
        isSupportedSocialMedia(account.socialMedia),
        "draft_invalid_account_social_media",
        { ...accountDetails, socialMedia: account.socialMedia },
    );
    assert(
        isPriceMap(account.prices),
        "draft_invalid_price_map",
        accountDetails,
    );

    if (account.source === "standalone") {
        assert(
            account.bundleId === undefined && account.offerId === undefined,
            "draft_invalid_source_fields",
            accountDetails,
        );
        return;
    }

    if (account.source === "bundle") {
        assert(
            Boolean(account.bundleId) && account.offerId === undefined,
            "draft_invalid_source_fields",
            accountDetails,
        );
        return;
    }

    assert(
        account.source === "offer",
        "draft_invalid_source_fields",
        accountDetails,
    );
    assert(
        Boolean(account.offerId) && account.bundleId === undefined,
        "draft_invalid_source_fields",
        accountDetails,
    );
};

const validateSupportedAccountGroups = (
    groups: ReadonlyMap<string, CampaignDraftAccountGetDto[]>,
): void => {
    groups.forEach((accounts) => {
        const sources = accounts.map((account) => account.source);
        const uniqueSources = new Set(sources);

        assert(
            uniqueSources.size === sources.length,
            "draft_unsupported_topology",
            { socialAccountId: accounts[0].socialAccountId, sources },
        );
        assert(
            (accounts.length === 1 &&
                (sources[0] === "standalone" ||
                    sources[0] === "bundle" ||
                    sources[0] === "offer")) ||
            (accounts.length === 2 &&
                uniqueSources.has("offer") &&
                uniqueSources.has("bundle")),
            "draft_unsupported_topology",
            { socialAccountId: accounts[0].socialAccountId, sources },
        );

        const workflowKey = getWorkflowKey(accounts[0]);
        assert(
            accounts.every(
                (account) => getWorkflowKey(account) === workflowKey,
            ),
            "draft_divergent_workflow_values",
            { socialAccountId: accounts[0].socialAccountId },
        );
    });
};

const validateContentReferences = (
    draft: CampaignDraftGetDto,
): void => {
    assert(
        Array.isArray(draft.campaignContent),
        "draft_invalid_content_reference",
    );

    const descriptionsByContentId = new Map<string, Set<string>>();

    draft.campaignContent.forEach((item) => {
        assert(
            typeof item._id === "string" && Boolean(item._id),
            "draft_invalid_content_reference",
        );
        assert(
            Array.isArray(item.descriptions),
            "draft_invalid_content_reference",
            { campaignContentItemId: item._id },
        );
        assert(
            !descriptionsByContentId.has(item._id),
            "draft_invalid_content_reference",
            { campaignContentItemId: item._id },
        );
        const descriptionIds = item.descriptions.map(
            (description) => description._id,
        );
        assert(
            descriptionIds.every(
                (descriptionId) =>
                    typeof descriptionId === "string" &&
                    Boolean(descriptionId),
            ),
            "draft_invalid_content_reference",
            { campaignContentItemId: item._id },
        );
        assert(
            hasUniqueStrings(descriptionIds),
            "draft_invalid_content_reference",
            { campaignContentItemId: item._id },
        );
        descriptionsByContentId.set(
            item._id,
            new Set(descriptionIds),
        );
    });

    draft.addedAccounts.forEach((account) => {
        const reference = account.selectedCampaignContentItem;

        if (!reference) return;

        const descriptionIds = descriptionsByContentId.get(
            reference.campaignContentItemId,
        );

        assert(
            descriptionIds?.has(reference.descriptionId),
            "draft_invalid_content_reference",
            {
                socialAccountId: account.socialAccountId,
                ...reference,
            },
        );
    });
};

const validateCommercialAggregates = (
    draft: CampaignDraftGetDto,
): void => {
    const bundleIds = draft.addedBundles.map((bundle) => bundle.bundleId);
    assert(
        hasUniqueStrings(bundleIds),
        "draft_bundle_membership_mismatch",
    );

    const bundlesById = new Map(
        draft.addedBundles.map((bundle) => [bundle.bundleId, bundle]),
    );
    const bundleRows = draft.addedAccounts.filter(
        (account) => account.source === "bundle",
    );

    bundleRows.forEach((account) =>
        assert(
            bundlesById.has(account.bundleId!),
            "draft_bundle_membership_mismatch",
            {
                bundleId: account.bundleId,
                socialAccountId: account.socialAccountId,
            },
        ),
    );
    draft.addedBundles.forEach((bundle) => {
        assert(
            Array.isArray(bundle.selectedAccountIds) &&
            Array.isArray(bundle.currentAccountIds),
            "draft_bundle_membership_mismatch",
            { bundleId: bundle.bundleId },
        );
        assert(
            isPriceMap(bundle.prices) && isPriceMap(bundle.originalPrices),
            "draft_invalid_price_map",
            { bundleId: bundle.bundleId },
        );
        const savedRowIds = bundleRows
            .filter((account) => account.bundleId === bundle.bundleId)
            .map((account) => account.socialAccountId);

        assert(
            savedRowIds.length > 0 &&
            haveSameStringSet(savedRowIds, bundle.selectedAccountIds),
            "draft_bundle_membership_mismatch",
            { bundleId: bundle.bundleId },
        );
        assert(
            haveSameStringSet(
                bundle.selectedAccountIds,
                bundle.currentAccountIds,
            ),
            "draft_bundle_membership_mismatch",
            { bundleId: bundle.bundleId },
        );
    });

    const offerRows = draft.addedAccounts.filter(
        (account) => account.source === "offer",
    );
    const selectedOffer = draft.selectedOffer;

    if (!selectedOffer) {
        assert(
            offerRows.length === 0,
            "draft_offer_membership_mismatch",
        );
        return;
    }

    assert(
        Array.isArray(selectedOffer.selectedAccountIds) &&
        Array.isArray(selectedOffer.currentAccountIds),
        "draft_offer_membership_mismatch",
        { offerId: selectedOffer.offerId },
    );
    assert(
        isPriceMap(selectedOffer.prices),
        "draft_invalid_price_map",
        { offerId: selectedOffer.offerId },
    );
    assert(
        offerRows.length > 0,
        "draft_offer_membership_mismatch",
        { offerId: selectedOffer.offerId },
    );
    assert(
        offerRows.every((account) => account.offerId === selectedOffer.offerId),
        "draft_offer_membership_mismatch",
        { offerId: selectedOffer.offerId },
    );
    assert(
        haveSameStringSet(
            offerRows.map((account) => account.socialAccountId),
            selectedOffer.selectedAccountIds,
        ),
        "draft_offer_membership_mismatch",
        { offerId: selectedOffer.offerId },
    );
    assert(
        haveSameStringSet(
            selectedOffer.selectedAccountIds,
            selectedOffer.currentAccountIds,
        ),
        "draft_offer_membership_mismatch",
        { offerId: selectedOffer.offerId },
    );
};

const buildSelectedBundles = (
    draft: CampaignDraftGetDto,
    bundleMetadataById?: ReadonlyMap<string, Bundle>,
): SelectedBundleSnapshot[] =>
    draft.addedBundles.map((bundle) => {
        const metadataBundle = bundleMetadataById?.get(bundle.bundleId);

        if (bundleMetadataById) {
            assert(
                metadataBundle,
                "draft_bundle_enrichment_failed",
                { bundleId: bundle.bundleId },
            );
        }

        if (metadataBundle) {
            assert(
                haveSameStringSet(
                    metadataBundle.accounts.map((account) => account.accountId),
                    bundle.selectedAccountIds,
                ),
                "draft_bundle_enrichment_mismatch",
                { bundleId: bundle.bundleId },
            );
        }

        const rowsByAccountId = new Map(
            draft.addedAccounts
                .filter(
                    (account) =>
                        account.source === "bundle" &&
                        account.bundleId === bundle.bundleId,
                )
                .map((account) => [account.socialAccountId, account]),
        );
        const metadataAccountsById = new Map(
            (metadataBundle?.accounts ?? []).map((account) => [
                account.accountId,
                account,
            ]),
        );
        const accounts = bundle.selectedAccountIds.map((accountId) => {
            const row = rowsByAccountId.get(accountId);
            assert(
                row,
                "draft_bundle_membership_mismatch",
                { bundleId: bundle.bundleId, socialAccountId: accountId },
            );
            const metadataAccount = metadataAccountsById.get(accountId);

            if (metadataBundle) {
                assert(
                    metadataAccount,
                    "draft_bundle_enrichment_mismatch",
                    { bundleId: bundle.bundleId, socialAccountId: accountId },
                );
                assert(
                    metadataAccount.socialMedia.toLowerCase() ===
                    row.socialMedia.toLowerCase(),
                    "draft_bundle_enrichment_mismatch",
                    { bundleId: bundle.bundleId, socialAccountId: accountId },
                );

                if (
                    isKnownProfileType(row.profileType) &&
                    isKnownProfileType(metadataAccount.profileType)
                ) {
                    assert(
                        row.profileType === metadataAccount.profileType,
                        "draft_bundle_enrichment_mismatch",
                        { bundleId: bundle.bundleId, socialAccountId: accountId },
                    );
                }
            }

            return {
                accountId: row.socialAccountId,
                influencerId: row.influencerId,
                username: row.username,
                logoUrl: row.logoUrl,
                followers: row.followers,
                prices: { ...row.prices },
                socialMedia: row.socialMedia,
                profileType:
                    row.profileType ?? metadataAccount?.profileType ?? "",
                countries: (
                    row.countries !== undefined
                        ? row.countries
                        : metadataAccount?.countries ?? []
                ).map((country) => ({ ...country })),
                engagementRate: metadataAccount?.engagementRate ?? 0,
                averageViews: metadataAccount?.averageViews ?? 0,
                communityMusicGenres: [
                    ...(row.communityMusicGenres !== undefined
                        ? row.communityMusicGenres
                        : metadataAccount?.communityMusicGenres ?? []),
                ],
                communityThemeTopics: [
                    ...(row.communityThemeTopics !== undefined
                        ? row.communityThemeTopics
                        : metadataAccount?.communityThemeTopics ?? []),
                ],
                creatorMusicGenres: [
                    ...(row.creatorMusicGenres !== undefined
                        ? row.creatorMusicGenres
                        : metadataAccount?.creatorMusicGenres ?? []),
                ],
                creatorContentFocus: [
                    ...(row.creatorContentFocus !== undefined
                        ? row.creatorContentFocus
                        : metadataAccount?.creatorContentFocus ?? []),
                ],
            };
        });

        return {
            bundleId: bundle.bundleId,
            influencerId: bundle.influencerId,
            prices: { ...bundle.prices },
            originalPrices: { ...bundle.originalPrices },
            followers: accounts.reduce(
                (sum, account) => sum + account.followers,
                0,
            ),
            accounts,
            createdAt: metadataBundle?.createdAt ?? "",
        };
    });

const buildDraftSelectionRows = (
    accounts: readonly CampaignDraftAccountGetDto[],
): HydratedCampaignBuilderDraftState["draftSelectionRows"] =>
    accounts.map((account) => ({
        selectionId: account.selectionId,
        source: account.source,
        influencerId: account.influencerId,
        socialAccountId: account.socialAccountId,
        socialMedia: account.socialMedia,
        ...(account.source === "bundle"
            ? { bundleId: account.bundleId! }
            : {}),
        ...(account.source === "offer"
            ? { offerId: account.offerId! }
            : {}),
    }));

export const validateCampaignDraftForHydration = (
    draft: CampaignDraftGetDto,
): void => {
    assert(isSupportedStep(draft.step), "draft_invalid_step");
    assert(
        isSupportedCurrency(draft.displayCurrency),
        "draft_invalid_currency",
    );
    assert(
        draft.socialMedia === "multipromo" ||
        isSupportedSocialMedia(draft.socialMedia),
        "draft_invalid_social_media",
    );
    assert(
        Array.isArray(draft.addedAccounts) &&
        Array.isArray(draft.addedBundles) &&
        draft.addedAccounts.length > 0,
        "draft_unsupported_topology",
    );
    assert(
        draft.addedAccounts.every((account) => account.isAvailable) &&
        draft.addedBundles.every((bundle) => bundle.isAvailable) &&
        (!draft.selectedOffer || draft.selectedOffer.isAvailable),
        "draft_unavailable_selection",
    );

    draft.addedAccounts.forEach(validateSourceRow);
    assert(
        hasUniqueStrings(
            draft.addedAccounts.map((account) => account.selectionId),
        ),
        "draft_duplicate_selection_id",
    );

    const accountGroups = groupAccountsById(draft.addedAccounts);
    validateSupportedAccountGroups(accountGroups);
    validateCommercialAggregates(draft);
    validateContentReferences(draft);
};

export type CampaignDraftHydrationOptions = {
    bundleMetadataById?: ReadonlyMap<string, Bundle>;
    offerMetadata?: PublishedOffer;
};

export const prepareCampaignBuilderStateFromDraft = (
    draft: CampaignDraftGetDto,
    options: CampaignDraftHydrationOptions = {},
): HydratedCampaignBuilderDraftState => {
    validateCampaignDraftForHydration(draft);

    const accountGroups = groupAccountsById(draft.addedAccounts);

    const currency = draft.displayCurrency;
    const currencyOption = CAMPAIGN_CURRENCY_OPTIONS.find(
        (option) => option.currency === currency,
    );
    assert(currencyOption, "draft_invalid_currency");

    const selectedPromoCardIds = draft.addedAccounts
        .filter((account) => account.source === "standalone")
        .map((account) => account.socialAccountId);
    const selectedBundles = buildSelectedBundles(
        draft,
        options.bundleMetadataById,
    );
    const selectedOffer = draft.selectedOffer ?? null;
    const selectedOfferAccountIds = selectedOffer?.selectedAccountIds ?? [];
    const offerMetadata = options.offerMetadata;

    if (selectedOffer && offerMetadata) {
        assert(
            offerMetadata.id === selectedOffer.offerId &&
            haveSameStringSet(
                offerMetadata.connectedAccounts.map(
                    (account) => account.accountId,
                ),
                selectedOfferAccountIds,
            ),
            "draft_offer_enrichment_mismatch",
            { offerId: selectedOffer.offerId },
        );
    }

    const offerMetadataAccountsById = new Map(
        (offerMetadata?.connectedAccounts ?? []).map((account) => [
            account.accountId,
            account,
        ]),
    );
    const offerRowsByAccountId = new Map(
        draft.addedAccounts
            .filter((account) => account.source === "offer")
            .map((account) => [account.socialAccountId, account]),
    );
    const selectedOfferAccounts = selectedOfferAccountIds.map((accountId) => {
        const row = offerRowsByAccountId.get(accountId);
        assert(
            row,
            "draft_offer_membership_mismatch",
            { offerId: selectedOffer?.offerId, socialAccountId: accountId },
        );
        const mappedAccount = mapDraftAccountToSelectedAccount(row, currency);
        const metadataAccount = offerMetadataAccountsById.get(accountId);

        if (offerMetadata) {
            assert(
                metadataAccount &&
                metadataAccount.socialMedia.toLowerCase() ===
                row.socialMedia.toLowerCase(),
                "draft_offer_enrichment_mismatch",
                { offerId: selectedOffer?.offerId, socialAccountId: accountId },
            );
        }

        if (!metadataAccount) return mappedAccount;

        const presentationAccount =
            mapOfferAccountToSelectedAccount(metadataAccount);

        return {
            ...mappedAccount,
            profileType:
                mappedAccount.profileType ??
                presentationAccount.profileType,
            genres:
                mappedAccount.genres !== undefined
                    ? mappedAccount.genres
                    : presentationAccount.genres,
            countries:
                mappedAccount.countries !== undefined
                    ? mappedAccount.countries
                    : presentationAccount.countries,
        };
    });

    const currentAccounts: SelectedCampaignAccount[] = [];
    accountGroups.forEach((accounts) => {
        const preferredAccount =
            accounts.find((account) => account.source === "offer") ??
            accounts.find((account) => account.source === "bundle") ??
            accounts[0];

        currentAccounts.push(
            mapDraftAccountToSelectedAccount(
                preferredAccount,
                currency,
            ),
        );
    });

    const normalizedAccounts = normalizeSelectedAccounts({
        currentAccounts,
        selectedPromoCardIds,
        selectedOfferAccountIds,
        offerAccounts: selectedOfferAccounts,
        selectedBundles,
    });
    assert(
        normalizedAccounts.length === accountGroups.size,
        "draft_unsupported_topology",
    );

    const selectedOfferPrice = selectedOffer
        ? selectedOffer.prices[currency]
        : undefined;
    assert(
        isCampaignSelectionPricingAvailable({
            selectedOfferId: selectedOffer?.offerId ?? null,
            selectedOfferPrice,
            selectedAccounts: normalizedAccounts,
            selectedBundles,
            selectedOfferAccountIds,
            currency,
        }),
        "draft_missing_currency_price",
        { currency },
    );

    const totalPrice = calcBuilderTotal({
        selectedOfferId: selectedOffer?.offerId ?? null,
        selectedOfferPrice,
        selectedAccounts: normalizedAccounts,
        selectedBundles,
        selectedOfferAccountIds,
        currency,
    });
    assert(
        Number.isInteger(totalPrice) && totalPrice >= 0,
        "draft_invalid_total",
        { currency, totalPrice },
    );

    return {
        campaignName: draft.campaignName,
        draftId: draft._id,
        draftStep: mapDraftStepToBuilderStep(draft.step),
        selectedOfferId: selectedOffer?.offerId ?? null,
        selectedOfferName: selectedOffer?.title ?? "",
        selectedOfferPrice,
        selectedOfferPrices: selectedOffer
            ? { ...selectedOffer.prices }
            : {},
        selectionCurrency: currency,
        selectedPromoCardIds,
        selectedOfferAccountIds,
        selectedAccounts: normalizedAccounts,
        selectedOfferAccounts,
        selectedBundles,
        draftSelectionRows: buildDraftSelectionRows(draft.addedAccounts),
        campaignContent: mapDraftContentToCampaignContent(
            draft.campaignContent,
        ),
        totalPrice,
        selectedCurrency: currencyOption.key,
    };
};

export const hydrateCampaignBuilderFromDraft = (
    draft: CampaignDraftGetDto,
    options: CampaignDraftHydrationOptions = {},
): HydratedCampaignBuilderDraftState => {
    let hydratedState: HydratedCampaignBuilderDraftState;

    try {
        hydratedState = prepareCampaignBuilderStateFromDraft(draft, options);
    } catch (error) {
        if (error instanceof CampaignDraftHydrationError) {
            throw error;
        }

        throw new CampaignDraftHydrationError(
            "draft_mapping_failed",
            {
                cause:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
        );
    }

    useCampaignBuilderStore
        .getState()
        .actions.hydrateFromDraft(hydratedState);

    return hydratedState;
};
