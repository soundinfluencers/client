import type { CampaignApiTargets } from "../model/campaign-filter.types";

export type CampaignFilterItemDto = {
    id: string;
    group: string;
    filterName: string;
    count: number;
    apiTargets?: CampaignApiTargets;
    children?: CampaignFilterItemDto[];
};

export type CampaignFilterMethodDto = {
    method: string;
};

export type CampaignFilterSectionDto = {
    id: string;
    title: string;
    AndOrFlag?: CampaignFilterMethodDto[];
    filters: CampaignFilterItemDto[];
};

export type GetCampaignFiltersResponseDto = {
    statusCode: number;
    message: string;
    data: {
        filterArr: CampaignFilterSectionDto[];
    };
};
