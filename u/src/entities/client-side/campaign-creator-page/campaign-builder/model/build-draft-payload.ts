import type {
    CampaignDraftAccountPayload,
    CampaignDraftAccountSocialMedia,
    CampaignDraftContentReference,
    CampaignDraftSocialMedia,
    CampaignDraftStep,
    SaveCampaignDraftPayload,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import { isMongoId, oid } from "../../../../../store/client/create-campaign/utils/oid.ts";
import type {
    CampaignBuilderState,
    DraftSelectionRow,
    SelectedCampaignAccount,
} from "./campaign-builder.types";

type BuildCampaignDraftPayloadOptions = {
    campaignName: string;
    step?: CampaignDraftStep;
    campaignContent?: CampaignBuilderState["campaignContent"];
    workflowValuesByAccountId?: CampaignDraftWorkflowValuesByAccountId;
    generateSelectionId?: () => string;
};

export type CampaignDraftWorkflowValue = {
    dateRequest?: string;
    selectedCampaignContentItem?: CampaignDraftContentReference;
};

export type CampaignDraftWorkflowValuesByAccountId = ReadonlyMap<
    string,
    CampaignDraftWorkflowValue
>;

type AccountWorkflowSource = {
    accountId?: string;
    socialAccountId?: string;
    dateRequest?: string;
    selectedCampaignContentItem?: CampaignDraftContentReference | null;
};

export type BuiltCampaignDraftPayload = {
    payload: SaveCampaignDraftPayload;
    draftSelectionRows: DraftSelectionRow[];
};

const DRAFT_ACCOUNT_SOCIAL_MEDIA = new Set<CampaignDraftAccountSocialMedia>([
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "spotify",
    "soundcloud",
    "press",
]);

const normalizeDraftAccountSocialMedia = (
    value: string,
): CampaignDraftAccountSocialMedia => {
    const normalized = value.toLowerCase() as CampaignDraftAccountSocialMedia;

    if (!DRAFT_ACCOUNT_SOCIAL_MEDIA.has(normalized)) {
        throw new Error(`Unsupported Draft social media: ${value}.`);
    }

    return normalized;
};

const getDraftSelectionOccurrenceKey = (
    row: Omit<DraftSelectionRow, "selectionId">,
): string => {
    if (row.source === "bundle") {
        return `bundle:${row.bundleId}:${row.socialAccountId}`;
    }

    if (row.source === "offer") {
        return `offer:${row.offerId}:${row.socialAccountId}`;
    }

    return `standalone:${row.socialAccountId}`;
};

const getPersistedOccurrenceKey = (row: DraftSelectionRow): string =>
    getDraftSelectionOccurrenceKey(row);

const createUniqueSelectionId = (
    generateSelectionId: () => string,
    usedSelectionIds: Set<string>,
): string => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const selectionId = generateSelectionId();

        if (isMongoId(selectionId) && !usedSelectionIds.has(selectionId)) {
            return selectionId;
        }
    }

    throw new Error("Could not generate a unique Draft selection ID.");
};

const buildSourceOccurrences = (
    state: CampaignBuilderState,
): Array<Omit<DraftSelectionRow, "selectionId">> => {
    const runtimeAccounts = new Map(
        state.selectedAccounts.map((account) => [
            String(account.accountId),
            account,
        ]),
    );
    const occurrences = new Map<
        string,
        Omit<DraftSelectionRow, "selectionId">
    >();

    const addOccurrence = (
        occurrence: Omit<DraftSelectionRow, "selectionId">,
    ) => {
        occurrences.set(
            getDraftSelectionOccurrenceKey(occurrence),
            occurrence,
        );
    };

    state.selectedPromoCardIds.forEach((accountId) => {
        const runtimeAccount = runtimeAccounts.get(String(accountId));

        if (!runtimeAccount) {
            throw new Error("Selected standalone account data is incomplete.");
        }

        addOccurrence({
            source: "standalone",
            influencerId: String(runtimeAccount.influencerId),
            socialAccountId: String(accountId),
            socialMedia: normalizeDraftAccountSocialMedia(
                runtimeAccount.socialMedia,
            ),
        });
    });

    state.selectedBundles.forEach((bundle) => {
        bundle.accounts.forEach((account) => {
            const socialAccountId = String(account.accountId);
            const runtimeAccount = runtimeAccounts.get(socialAccountId);

            addOccurrence({
                source: "bundle",
                bundleId: String(bundle.bundleId),
                influencerId: String(
                    runtimeAccount?.influencerId ?? account.influencerId,
                ),
                socialAccountId,
                socialMedia: normalizeDraftAccountSocialMedia(
                    runtimeAccount?.socialMedia ?? account.socialMedia,
                ),
            });
        });
    });

    if (state.selectedOfferId) {
        if (state.selectedOfferAccountIds.length === 0) {
            throw new Error("Selected Offer account data is incomplete.");
        }

        state.selectedOfferAccountIds.forEach((accountId) => {
            const runtimeAccount = runtimeAccounts.get(String(accountId));

            if (!runtimeAccount) {
                throw new Error("Selected Offer account data is incomplete.");
            }

            addOccurrence({
                source: "offer",
                offerId: state.selectedOfferId as string,
                influencerId: String(runtimeAccount.influencerId),
                socialAccountId: String(accountId),
                socialMedia: normalizeDraftAccountSocialMedia(
                    runtimeAccount.socialMedia,
                ),
            });
        });
    }

    return Array.from(occurrences.values());
};

export const reconcileDraftSelectionRows = (
    state: CampaignBuilderState,
    generateSelectionId: () => string = oid,
): DraftSelectionRow[] => {
    const previousRowsByOccurrence = new Map(
        state.draftSelectionRows.map((row) => [
            getPersistedOccurrenceKey(row),
            row,
        ]),
    );
    const usedSelectionIds = new Set<string>();

    return buildSourceOccurrences(state).map((occurrence) => {
        const previousRow = previousRowsByOccurrence.get(
            getDraftSelectionOccurrenceKey(occurrence),
        );
        const canReuseSelectionId =
            previousRow &&
            isMongoId(previousRow.selectionId) &&
            !usedSelectionIds.has(previousRow.selectionId);
        const selectionId = canReuseSelectionId
            ? previousRow.selectionId
            : createUniqueSelectionId(generateSelectionId, usedSelectionIds);

        usedSelectionIds.add(selectionId);

        return {
            ...occurrence,
            selectionId,
        };
    });
};

const getDraftSocialMedia = (
    rows: DraftSelectionRow[],
): CampaignDraftSocialMedia => {
    const socialMedia = new Set(rows.map((row) => row.socialMedia));

    if (socialMedia.size === 0) {
        throw new Error("Please select accounts before saving draft.");
    }

    return socialMedia.size === 1
        ? (socialMedia.values().next().value as CampaignDraftAccountSocialMedia)
        : "multipromo";
};

const mapDraftAccountPayload = (
    row: DraftSelectionRow,
    runtimeAccount: SelectedCampaignAccount,
    workflowValuesByAccountId?: CampaignDraftWorkflowValuesByAccountId,
): CampaignDraftAccountPayload => {
    const hasWorkflowOverride = workflowValuesByAccountId?.has(
        row.socialAccountId,
    );
    const workflowOverride = workflowValuesByAccountId?.get(
        row.socialAccountId,
    );
    const selectedCampaignContentItem = hasWorkflowOverride
        ? workflowOverride?.selectedCampaignContentItem
        : runtimeAccount.selectedCampaignContentItem ?? undefined;
    const workflowFields = selectedCampaignContentItem
        ? {
            selectedCampaignContentItem: {
                campaignContentItemId:
                    selectedCampaignContentItem.campaignContentItemId,
                descriptionId:
                    selectedCampaignContentItem.descriptionId,
            },
        }
        : {};
    const dateRequest =
        workflowOverride?.dateRequest ??
        runtimeAccount.dateRequest ??
        "ASAP";

    if (row.source === "bundle") {
        return {
            selectionId: row.selectionId,
            source: row.source,
            bundleId: row.bundleId as string,
            influencerId: row.influencerId,
            socialAccountId: row.socialAccountId,
            socialMedia: row.socialMedia,
            dateRequest,
            ...workflowFields,
        };
    }

    if (row.source === "offer") {
        return {
            selectionId: row.selectionId,
            source: row.source,
            offerId: row.offerId as string,
            influencerId: row.influencerId,
            socialAccountId: row.socialAccountId,
            socialMedia: row.socialMedia,
            dateRequest,
            ...workflowFields,
        };
    }

    return {
        selectionId: row.selectionId,
        source: row.source,
        influencerId: row.influencerId,
        socialAccountId: row.socialAccountId,
        socialMedia: row.socialMedia,
        dateRequest,
        ...workflowFields,
    };
};

export const buildCampaignDraftWorkflowValuesByAccountId = (
    accounts: readonly AccountWorkflowSource[],
): Map<string, CampaignDraftWorkflowValue> => {
    const workflowValues = new Map<string, CampaignDraftWorkflowValue>();

    accounts.forEach((account) => {
        const accountId = String(
            account.socialAccountId ?? account.accountId ?? "",
        );

        if (!accountId) return;

        workflowValues.set(accountId, {
            dateRequest: account.dateRequest,
            ...(account.selectedCampaignContentItem
                ? {
                    selectedCampaignContentItem: {
                        campaignContentItemId:
                            account.selectedCampaignContentItem
                                .campaignContentItemId,
                        descriptionId:
                            account.selectedCampaignContentItem.descriptionId,
                    },
                }
                : {}),
        });
    });

    return workflowValues;
};

const assertCampaignDraftContentReferences = (
    addedAccounts: CampaignDraftAccountPayload[],
    campaignContent: CampaignBuilderState["campaignContent"],
): void => {
    const contentById = new Map(
        campaignContent.map((item) => [String(item._id), item]),
    );

    addedAccounts.forEach((account) => {
        const reference = account.selectedCampaignContentItem;

        if (!reference) return;

        const contentItem = contentById.get(reference.campaignContentItemId);
        const hasDescription = contentItem?.descriptions.some(
            (description) =>
                String(description._id) === reference.descriptionId,
        );

        if (!contentItem || !hasDescription) {
            throw new Error(
                `Selected content reference is invalid for account ${account.socialAccountId}.`,
            );
        }
    });
};

export const buildCampaignDraftPayload = (
    state: CampaignBuilderState,
    options: BuildCampaignDraftPayloadOptions,
): BuiltCampaignDraftPayload => {
    if (!state.selectionCurrency) {
        throw new Error("Campaign currency is required to save draft.");
    }

    const draftSelectionRows = reconcileDraftSelectionRows(
        state,
        options.generateSelectionId,
    );
    const runtimeAccounts = new Map(
        state.selectedAccounts.map((account) => [
            String(account.accountId),
            account,
        ]),
    );
    const addedAccounts = draftSelectionRows.map((row) => {
        const runtimeAccount = runtimeAccounts.get(row.socialAccountId);

        if (!runtimeAccount) {
            throw new Error("Selected account workflow data is incomplete.");
        }

        return mapDraftAccountPayload(
            row,
            runtimeAccount,
            options.workflowValuesByAccountId,
        );
    });
    const campaignContent = options.campaignContent ?? state.campaignContent ?? [];

    assertCampaignDraftContentReferences(addedAccounts, campaignContent);
    const selectedOffer = state.selectedOfferId
        ? {
            offerId: state.selectedOfferId,
            selectedAccountIds: Array.from(
                new Set(state.selectedOfferAccountIds.map(String)),
            ),
        }
        : undefined;

    return {
        draftSelectionRows,
        payload: {
            ...(state.draftId ? { draftId: state.draftId } : {}),
            campaignName: options.campaignName,
            socialMedia: getDraftSocialMedia(draftSelectionRows),
            displayCurrency: state.selectionCurrency,
            step: options.step ?? "addAccounts",
            addedAccounts,
            ...(selectedOffer ? { selectedOffer } : {}),
            campaignContent,
        },
    };
};

export const hasDraftSelection = (state: CampaignBuilderState): boolean =>
    Boolean(
        state.selectedOfferId ||
        state.selectedBundles.length ||
        state.selectedPromoCardIds.length,
    );
