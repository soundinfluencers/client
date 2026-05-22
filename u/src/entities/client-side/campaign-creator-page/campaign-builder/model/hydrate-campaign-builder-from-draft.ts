import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";

export const hydrateCampaignBuilderFromDraft = (
    draft: CampaignDraftDto,
) => {
    const store = useCampaignBuilderStore.getState();

    store.actions.hydrateFromDraft({
        draftId: String(draft._id),
        draftStep: draft.step,

        campaignName: draft.campaignName ?? "",

        totalPrice: Number(draft.totalPrice ?? 0),

        selectedOfferId: null,
        selectedOfferAccountIds: [],

        selectedPromoCardIds:
            draft.addedAccounts?.map((acc) =>
                String(acc.socialAccountId),
            ) ?? [],

        selectedAccounts:
            draft.addedAccounts?.map((acc) => ({
                accountId: String(acc.socialAccountId),

                influencerId: String(acc.influencerId),

                username: acc.username ?? "",

                socialMedia: acc.socialMedia,

                followers: Number(acc.followers ?? 0),

                profileType: acc.profileType,

                price: Number(acc.price ?? 0),

                logoUrl: acc.logoUrl ?? "",

                source: "manual" as const,

                selectedCampaignContentItem:
                    acc.selectedCampaignContentItem ?? null,

                dateRequest:
                    acc.dateRequest ?? "ASAP",
            })) ?? [],

        campaignContent: draft.campaignContent ?? [],

        postContentDraft: null,

        blocksDraft: null,
    });
};