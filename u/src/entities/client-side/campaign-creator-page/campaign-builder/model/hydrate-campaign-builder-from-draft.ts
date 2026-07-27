import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";

export const hydrateCampaignBuilderFromDraft = (
    draft: CampaignDraftDto,
) => {
    const store = useCampaignBuilderStore.getState();
    const selectedAccounts = draft.addedAccounts?.filter(
        (account) => account.isAvailable !== false && account.isSelected !== false,
    ) ?? [];

    store.actions.hydrateFromDraft({
        draftId: String(draft._id),
        draftStep: draft.step,
        draftRevision: Number(draft.revision ?? 0),

        campaignName: draft.campaignName ?? "",

        totalPrice: Number(draft.totalPrice ?? 0),

        selectedOfferId: null,
        selectedOfferAccountIds: [],

        selectedPromoCardIds:
            selectedAccounts.map((acc) =>
                String(acc.socialAccountId),
            ),

        selectedAccounts:
            selectedAccounts.map((acc) => ({
                accountId: String(acc.socialAccountId),

                influencerId: String(acc.influencerId),

                username: acc.username ?? "",

                socialMedia: acc.socialMedia,

                followers: Number(acc.followers ?? 0),

                profileType: acc.profileType,

                price: Number(acc.price ?? 0),

                logoUrl: acc.logoUrl ?? "",

                source: "manual" as const,

                // The backend GET returns the assignment as `selectedContent`; older callers
                // expected `selectedCampaignContentItem`. Accept both so the content-to-account
                // assignment survives draft resume (it silently dropped before).
                selectedCampaignContentItem:
                    acc.selectedCampaignContentItem ??
                    (acc as any).selectedContent ??
                    null,

                dateRequest:
                    acc.dateRequest ?? "ASAP",
            })),

        campaignContent: draft.campaignContent ?? [],

        postContentDraft: null,

        blocksDraft: null,
    });
};
