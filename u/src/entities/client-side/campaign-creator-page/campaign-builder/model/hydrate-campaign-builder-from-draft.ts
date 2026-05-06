import { useCampaignBuilderStore } from "./campaign-builder.store";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import {
    mapDraftAccountToSelectedAccount,
    mapDraftContentToCampaignContent, mapDraftStepToBuilderStep
} from "@/entities/client-side/campaign-draft/model/campaign-draft.mappers.ts";


export const hydrateCampaignBuilderFromDraft = (draft: CampaignDraftDto) => {
    const selectedAccounts = (draft.addedAccounts ?? []).map(
        mapDraftAccountToSelectedAccount,
    );
    console.log(selectedAccounts,'qwe')
    const selectedPromoCardIds = selectedAccounts.map((item) => item.accountId);

    const campaignContent = mapDraftContentToCampaignContent(
        draft.campaignContent ?? [],
    );

    useCampaignBuilderStore.getState().actions.hydrateFromDraft({
        draftId: String(draft._id),
        draftStep: mapDraftStepToBuilderStep(draft.step),
        campaignName: String(draft.campaignName ?? ""),
        totalPrice: Number(draft.totalPrice),
        selectedOfferId: null,
        selectedOfferAccountIds: [],
        selectedAccounts,
        selectedPromoCardIds,
        campaignContent,
    });
};