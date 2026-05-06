
import type {
    GetCampaignsResponseDto,
    CampaignStatusDto,
} from "./campaign.types";
import type { CampaignFilterStatus, CampaignListItem } from "../model/campaign.types";
import {mapCampaignListItemDto} from "@/entities/client-side/dashboard/model/campaign.mappers.ts";
import $api from "@/api/api.ts";

type GetCampaignsParams = {
    status: CampaignFilterStatus;
    page: number;
    limit: number;
};

export const getCampaigns = async ({
                                       status,
                                       page,
                                       limit,
                                   }: GetCampaignsParams): Promise<CampaignListItem[]> => {
    const params: Record<string, string | number> = {
        page,
        limit,
    };

    if (status !== "all") {
        params.status = status as CampaignStatusDto;
    }

    const response = await $api.get<GetCampaignsResponseDto>("/campaigns", {
        params,
    });

    return response.data.data.campaigns.map(mapCampaignListItemDto);
};