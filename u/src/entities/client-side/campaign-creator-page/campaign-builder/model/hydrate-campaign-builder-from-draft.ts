import { useCampaignBuilderStore } from "./campaign-builder.store";
import { CampaignDraftLatestStep, type CampaignBuilderState } from "./campaign-builder.types";
import { getDraftRowIds } from "./selected-offer";
import { currencySymbol } from "./selected-offer";
import { calcBuilderTotal } from "./calc-builder-total";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";

export const mapDraftToBuilder = (
    draft: CampaignDraftDto,
) => {
    const offer = draft.selectedOffer ?? null;
    const membership = new Set(offer?.selectedAccountIds ?? []);
    return {
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
            draft.addedAccounts?.filter((acc) => !membership.has(acc.socialAccountId)).map((acc) =>
                String(acc.socialAccountId),
            ) ?? [],

        selectedAccounts:
            draft.addedAccounts?.map((acc) => ({
                ...getDraftRowIds(acc),
                accountId: String(acc.socialAccountId),
                ...(acc.bundleId ? { bundleId: acc.bundleId } : {}),

                influencerId: String(acc.influencerId),

                username: acc.username ?? "",

                socialMedia: acc.socialMedia,

                followers: Number(acc.followers ?? 0),

                profileType: acc.profileType,

                price: acc.prices?.[draft.displayCurrency] ?? 0,
                priceCurrency: draft.displayCurrency,
                prices: acc.prices ? { ...acc.prices } : undefined,

                logoUrl: acc.logoUrl ?? "",
                countries: acc.countries,
                communityMusicGenres: acc.communityMusicGenres,
                communityThemeTopics: acc.communityThemeTopics,
                creatorMusicGenres: acc.creatorMusicGenres,
                creatorContentFocus: acc.creatorContentFocus,

                source: acc.source === "offer" ? "offer" as const : acc.source === "bundle" ? "bundle" as const : "manual" as const,

                selectedCampaignContentItem:
                    acc.selectedCampaignContentItem ?? null,

                dateRequest:
                    acc.dateRequest ?? "ASAP",
            })) ?? [],

        campaignContent: draft.campaignContent ?? [],

        postContentDraft: null,

        blocksDraft: null,
    } satisfies Partial<CampaignBuilderState>;
};

export const hydrateCampaignBuilderFromDraft = (draft: CampaignDraftDto) => {
    useCampaignBuilderStore.getState().actions.hydrateFromDraft(mapDraftToBuilder(draft));
};
