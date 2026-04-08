export enum CampaignDraftLatestStep {
    addAccounts = "addAccounts",
    addContent = "addContent",
    strategyTable = "strategyTable",
}
export type SaveDraftParams = {
    step: CampaignDraftLatestStep;
    state: any;
    actions: any;
    campaignName: string;
    navigate?: (path: string) => void;
    postCampaignDraft: (payload: any) => Promise<any>;
    updateCampaignDraft?: (payload: any) => Promise<any>;
    overrides?: {
        campaignContent?: any[];
    };
    withNavigate?: boolean;
};