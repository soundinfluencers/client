import { useCampaignStore } from "@/client-side/store";
import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import type {
    DraftAddedAccount,
    DraftDetailsResponse,
} from "@/client-side/pages/client-dashboard/types/draft-open.types";
import type { ConnectedAccount } from "@/client-side/types/offers";
import type { ICampaignAccount } from "@/client-side/store/create-campaign/types";
import type { CampaignContentItem } from "@/client-side/types/content";
import { mapDraftCampaignContentToPostContentDraft } from "./map-draft-to-post-content.ts";

const mapDraftAccountToCampaignAccount = (
    item: DraftAddedAccount,
): ICampaignAccount => {
    return {
        accountId: item.socialAccountId,
        influencerId: item.influencerId,
        socialMedia: item.socialMedia,
        username: item.username,
        selectedCampaignContentItem: {
            campaignContentItemId:
                item.selectedContent?.campaignContentItemId ?? "",
            descriptionId: item.selectedContent?.descriptionId ?? "",
        },
        dateRequest: "ASAP",
    };
};

const mapDraftAccountToPromoCard = (
    item: DraftAddedAccount,
): ConnectedAccount => {
    return {
        accountId: item.socialAccountId,
        influencerId: item.influencerId,
        socialMedia: item.socialMedia,
        username: item.username,
        logoUrl: item.logoUrl ?? "",
        followers: item.followers ?? 0,
        prices: {
            EUR: item.price ?? 0,
            USD: item.price ?? 0,
            GBP: item.price ?? 0,
        },
        countries: [],
        musicGenres: [],
        creatorCategories: [],
        categories: [],
    };
};

export const hydrateCampaignStoreFromDraft = (
    draft: DraftDetailsResponse,
) => {
    console.log("HYDRATE_RAW_DRAFT", draft);
    console.log("HYDRATE_RAW_DRAFT_campaignContent", draft.campaignContent);
    console.log(
        "HYDRATE_RAW_DRAFT_campaignContent_length",
        draft.campaignContent?.length,
    );
    const { actions } = useCampaignStore.getState();

    const mappedAccounts: ICampaignAccount[] = (draft.addedAccounts ?? []).map(
        mapDraftAccountToCampaignAccount,
    );

    const mappedPromoCards: ConnectedAccount[] = (draft.addedAccounts ?? []).map(
        mapDraftAccountToPromoCard,
    );

    const mappedCampaignContent: CampaignContentItem[] =
        draft.campaignContent ?? [];

    const mappedPostContentDraft = mapDraftCampaignContentToPostContentDraft(
        draft.campaignName ?? "",
        mappedCampaignContent,
    );

    actions.resetCampaign();

    useCampaignStore.setState({
        draftId: draft._id,
        draftStep: draft.step,
        campaignName: draft.campaignName ?? "",
        selectedAccounts: mappedAccounts,
        totalPrice: draft.totalPrice ?? 0,
        promoCard: mappedPromoCards,
        promoCardUI: mappedPromoCards,
        campaignContent:
            draft.step === CampaignDraftLatestStep.addAccounts
                ? []
                : mappedCampaignContent,
        postContentDraft:
            draft.step === CampaignDraftLatestStep.addContent
                ? mappedPostContentDraft
                : null,
    });
    console.log("STORE_AFTER_HYDRATE", useCampaignStore.getState());
    console.log(
        "POST_CONTENT_DRAFT_KEYS",
        Object.keys(useCampaignStore.getState().postContentDraft ?? {}),
    );
    console.log("STORE_AFTER_HYDRATE", useCampaignStore.getState());
};