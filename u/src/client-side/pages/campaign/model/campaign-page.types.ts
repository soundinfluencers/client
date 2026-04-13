export type CampaignKind = "proposal" | "regular" | "draft";

export type CampaignViewMode = -1 | 0 | 1 | 2;

export type LastCampaignSession = {
    id: string;
    status: "draft" | "proposal" | "regular" | "pending";
    optionIndex?: number;
};

export type RequestState = {
    isRequesting: boolean;
    isRequestSent: boolean;
    isRequestingPDF: boolean;
};

export type CampaignPageModalState = {
    optionModal: boolean;
    requestModal: boolean;
};

export type CampaignPageLocalState = {
    activeOption: number;
    changeView: boolean;
    view: CampaignViewMode;
    localExtraOptions: number[];
    textareaValue: string;
    flag: boolean;
};

export type CampaignPageData = any;