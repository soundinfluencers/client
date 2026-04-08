import type { ApiResponse, MongoId, SocialMedia } from "./common";
import type {
    CampaignAccountRequestItem,
    CampaignAddedAccount,
} from "./account";
import type { CampaignContentItem } from "./content";
import type { PaymentDetails } from "./payment";

export type CreateProposalPayload = {
    campaignName: string;
    socialMedia: SocialMedia;
    campaignPrice: number;
    addedAccounts: CampaignAccountRequestItem[];
    campaignContent: CampaignContentItem[];
    paymentDetails: PaymentDetails;
};

export type UpdateProposalPayload = {
    campaignName: string;
    addedAccounts: CampaignAccountRequestItem[];
    campaignContent: CampaignContentItem[];
};

export type ProposalOption = {
    optionIndex: number;
    price: number;
    addedAccounts: CampaignAddedAccount[];
    campaignContent: CampaignContentItem[];
    canEdit: boolean;
};

export type ProposalSystem = {
    campaignId: MongoId;
    campaignName: string;
    socialMedia: SocialMedia;
    existingOptions: number[];
    selectedOption: ProposalOption;
};

export type GetProposalSystemResponse = ApiResponse<ProposalSystem>;