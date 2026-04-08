import type { CampaignStatusType, CampaignForList } from "@/types/client/dashboard/campaign.types";


export type CampaignFilterStatus = CampaignStatusType | "all";

export type DashboardCampaignOpenParams = {
    id: string;
    status: CampaignStatusType;
    optionIndex?: number;
};

export type DashboardCampaignList = CampaignForList[];