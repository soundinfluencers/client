import {CampaignDraftLatestStep, type SaveDraftParams} from "@/client-side/types/draft.types";
export const uid = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(12)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};
type DraftPayloadOverrides = {
    campaignName?: string;
    draftId?: string | null;
    campaignContent?: any[];
};

export const resolveDraftSocialMedia = (state: any): string => {
    const firstFromContent = state.campaignContent?.[0]?.socialMedia;
    const firstFromAccounts = state.selectedAccounts?.[0]?.socialMedia;
    const firstFromPromo = state.promoCard?.[0]?.socialMedia;
    const firstFromOfferAccount = state.offer?.connectedAccounts?.[0]?.socialMedia;
    const fromOffer = state.offer?.socialMedia;

    return String(
        firstFromContent ||
        firstFromAccounts ||
        firstFromPromo ||
        firstFromOfferAccount ||
        fromOffer ||
        "instagram",
    ).toLowerCase();
};

export const mapDraftAddedAccounts = (
    state: any,
    fallbackSocialMedia: string,
) => {
    const map = new Map<string, any>();

    const addAccount = (item: any, source: "selected" | "offer" | "promo" | "promoUI") => {
        const socialAccountId =
            item?.accountId ||
            item?.socialAccountId ||
            item?._id ||
            "";

        if (!socialAccountId) return;

        const influencerId = item?.influencerId ?? "";
        const socialMedia = String(
            item?.socialMedia || fallbackSocialMedia,
        ).toLowerCase();

        const username = String(item?.username ?? "");

        const existing = map.get(socialAccountId);
        map.set(socialAccountId, {
            influencerId: existing?.influencerId || influencerId,
            socialAccountId,
            socialMedia: existing?.socialMedia || socialMedia,
            username: existing?.username || username,
            selectedContent: {
                campaignContentItemId:
                uid(),
                descriptionId:
                    uid(),
            },
            __source: source,
        });
    };

    (state.selectedAccounts ?? []).forEach((a: any) => addAccount(a, "selected"));
    (state.offer?.connectedAccounts ?? []).forEach((a: any) => addAccount(a, "offer"));
    (state.promoCard ?? []).forEach((a: any) => addAccount(a, "promo"));
    (state.promoCardUI ?? []).forEach((a: any) => addAccount(a, "promoUI"));

    return Array.from(map.values()).map(({ __source, ...rest }) => rest);
};

export const buildCampaignDraftPayload = (
    state: any,
    step: CampaignDraftLatestStep,
    overrides?: DraftPayloadOverrides,
) => {

    const draftSocialMedia = resolveDraftSocialMedia(state);

    const payload: any = {
        campaignName: overrides?.campaignName ?? state.campaignName ?? "",
        socialMedia: draftSocialMedia,
        step,
        addedAccounts: mapDraftAddedAccounts(state, draftSocialMedia),
    };

    if (
        step === CampaignDraftLatestStep.addContent ||
        step === CampaignDraftLatestStep.strategyTable
    ) {
        payload.campaignContent =
            overrides?.campaignContent ?? state.campaignContent ?? [];
    }

    if (overrides?.draftId ?? state.draftId) {
        payload.draftId = overrides?.draftId ?? state.draftId;
    }

    return payload;
};

export const draftStepRouteMap: Record<CampaignDraftLatestStep, string> = {
    [CampaignDraftLatestStep.addAccounts]: "/1",
    [CampaignDraftLatestStep.addContent]: "/2",
    [CampaignDraftLatestStep.strategyTable]: "/3",
};

export const hasDraftSelection = (state: any) => {
    return Boolean(
        state.offer ||
        state.selectedAccounts?.length ||
        state.promoCard?.length ||
        state.promoCardUI?.length,
    );
};



export const saveCampaignDraftByStep = async ({
                                                  step,
                                                  state,
                                                  actions,
                                                  campaignName,
                                                  navigate,
                                                  postCampaignDraft,
                                                  updateCampaignDraft,
                                                  overrides,
                                                  withNavigate = false,
                                              }: SaveDraftParams) => {
    if (!hasDraftSelection(state)) {
        throw new Error("Please select offer or promo cards before saving draft.");
    }

    if (!campaignName.trim()) {
        throw new Error("Draft name is required.");
    }

    const payload = buildCampaignDraftPayload(state, step, {
        campaignName: campaignName.trim(),
        draftId: state.draftId,
        campaignContent: overrides?.campaignContent,
    });
    console.log(payload,"payload-draft");
    const response =
        payload.draftId && updateCampaignDraft
            ? await updateCampaignDraft(payload)
            : await postCampaignDraft(payload);

    const newDraftId =
        response?.draftId ||
        response?._id ||
        response?.data?.draftId ||
        response?.data?._id ||
        payload.draftId ||
        null;

    actions.setDraftId?.(newDraftId);
    actions.setDraftStep?.(step);
    actions.setCampaignName?.(campaignName.trim());

    if (withNavigate && navigate) {
        navigate(draftStepRouteMap[step]);
    }

    return response;
};