import { useCampaignBuilderStore } from "./campaign-builder.store";
import { CampaignDraftLatestStep, type CampaignBuilderState } from "./campaign-builder.types";
import { getDraftRowIds } from "./selected-offer";
import { currencySymbol } from "./selected-offer";
import { calcBuilderTotal } from "./calc-builder-total";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import { reconcileDraftSelectionRows } from "./draft-occurrences";

const validateDraft = (draft: CampaignDraftDto) => {
    if (!draft._id || !["addAccounts", "addContent", "strategyTable"].includes(draft.step) ||
        !["EUR", "USD", "GBP"].includes(draft.displayCurrency) || !Array.isArray(draft.addedAccounts)) {
        throw new Error("This Draft has an invalid identity, step or currency. No builder data was changed.");
    }
    const offer = draft.selectedOffer ?? null;
    for (const row of draft.addedAccounts) {
        if (!["standalone", "offer", "bundle"].includes(row.source) ||
            (row.source === "standalone" && (row.offerId || row.bundleId)) ||
            (row.source === "offer" && (!offer || row.offerId !== offer.offerId || row.bundleId)) ||
            (row.source === "bundle" && (!row.bundleId || row.offerId))) {
            throw new Error("This Draft has inconsistent source/group membership. No builder data was changed.");
        }
    }
    reconcileDraftSelectionRows(draft.addedAccounts.map((a) => ({ ...a, accountId: a.socialAccountId,
        source: a.source === "standalone" ? "manual" : a.source })), offer);
    for (const bundle of draft.addedBundles ?? []) {
        const saved = draft.addedAccounts.filter((a) => a.source === "bundle" && a.bundleId === bundle.bundleId).map((a) => a.socialAccountId);
        if (!saved.length || saved.length !== bundle.selectedAccountIds.length || bundle.selectedAccountIds.some((id) => !saved.includes(id))) {
            throw new Error("This Draft has inconsistent saved Bundle membership. No builder data was changed.");
        }
    }
};

export const mapDraftToBuilder = (
    draft: CampaignDraftDto,
) => {
    validateDraft(draft);
    const offer = draft.selectedOffer ?? null;
    const membership = new Set(offer?.selectedAccountIds ?? []);
    return {
        selectedBundles: (draft.addedBundles ?? []).map((bundle) => ({
            ...bundle,
            influencerId: bundle.influencerId ?? "",
            prices: { ...bundle.prices }, originalPrices: { ...bundle.originalPrices },
            createdAt: "", followers: 0,
            // Saved occurrences are authoritative; currentAccountIds is availability metadata only.
            accounts: draft.addedAccounts.filter((a) => a.source === "bundle" && a.bundleId === bundle.bundleId).map((a) => ({
                accountId: a.socialAccountId, influencerId: a.influencerId, socialMedia: a.socialMedia,
                username: a.username, logoUrl: a.logoUrl ?? "", followers: a.followers ?? 0,
                prices: { ...a.prices }, profileType: a.profileType ?? "", engagementRate: 0, averageViews: 0,
                countries: (a.countries ?? []).map((c) => ({ ...c, percentage: c.percentage ?? 0 })),
                communityMusicGenres: [...(a.communityMusicGenres ?? [])], communityThemeTopics: [...(a.communityThemeTopics ?? [])],
                creatorMusicGenres: [...(a.creatorMusicGenres ?? [])], creatorContentFocus: [...(a.creatorContentFocus ?? [])],
            })),
        })),
        draftId: String(draft._id),
        draftStep: CampaignDraftLatestStep[draft.step],
        unsupportedDraftBundles: Boolean(draft.addedBundles?.length || draft.addedAccounts.some((a) => a.source === "bundle" || a.bundleId)),

        campaignName: draft.campaignName ?? "",

        totalPrice: calcBuilderTotal({
            selectedOfferId: offer?.offerId ?? null,
            selectedOfferAccountIds: offer?.selectedAccountIds ?? [],
            selectedOfferPrices: offer?.prices,
            selectedCurrency: draft.displayCurrency,
            selectedAccounts: draft.addedAccounts.map((a) => ({ ...a, source: undefined, accountId: a.socialAccountId })),
        }),

        selectedOfferId: offer?.offerId ?? null,
        selectedOfferAccountIds: [...(offer?.selectedAccountIds ?? [])],
        selectedOfferName: offer?.title ?? "",
        selectedOfferPrice: offer?.prices?.[draft.displayCurrency] ?? null,
        selectedOfferPrices: offer?.prices ? { ...offer.prices } : null,
        selectedOfferIsAvailable: offer?.isAvailable ?? null,
        selectedOfferUnavailableReason: offer?.unavailableReason ?? null,
        offerCatalogContext: offer?.socialMedia || offer?.genre ? { platform: offer.socialMedia ?? "", genre: offer.genre ?? "" } : null,
        selectedCurrency: currencySymbol(draft.displayCurrency),

        selectedPromoCardIds:
            draft.addedAccounts?.filter((acc) => acc.source === "standalone" && !membership.has(acc.socialAccountId)).map((acc) =>
                String(acc.socialAccountId),
            ) ?? [],

        selectedAccounts:
            draft.addedAccounts?.map((acc) => ({
                ...getDraftRowIds(acc),
                isAvailable: acc.isAvailable,
                unavailableReason: acc.unavailableReason,
                accountId: String(acc.socialAccountId),
                ...(acc.bundleId ? { bundleId: acc.bundleId } : {}),

                influencerId: String(acc.influencerId),

                username: acc.username ?? "",

                socialMedia: acc.socialMedia,

                followers: Number(acc.followers ?? 0),

                profileType: acc.profileType,

                price: acc.prices?.[draft.displayCurrency],
                priceCurrency: draft.displayCurrency,
                prices: acc.prices ? { ...acc.prices } : undefined,

                logoUrl: acc.logoUrl ?? "",
                countries: acc.countries,
                communityMusicGenres: acc.communityMusicGenres,
                communityThemeTopics: acc.communityThemeTopics,
                creatorMusicGenres: acc.creatorMusicGenres,
                creatorContentFocus: acc.creatorContentFocus,

                source: acc.source === "offer" ? "offer" as const : acc.source === "bundle" ? "bundle" as const : "manual" as const,

                ...(Object.hasOwn(acc, "selectedCampaignContentItem") ? { selectedCampaignContentItem: acc.selectedCampaignContentItem } : {}),

                dateRequest:
                    acc.dateRequest ?? "ASAP",
            })) ?? [],

        campaignContent: draft.campaignContent ?? [],

        postContentDraft: null,

        blocksDraft: null,
    } satisfies Partial<CampaignBuilderState>;
};

export const hydrateCampaignBuilderFromDraft = (draft: CampaignDraftDto) => {
    // Build and validate a detached snapshot completely before the single store update.
    const next = mapDraftToBuilder(structuredClone(draft));
    useCampaignBuilderStore.getState().actions.hydrateFromDraft(next);
};
