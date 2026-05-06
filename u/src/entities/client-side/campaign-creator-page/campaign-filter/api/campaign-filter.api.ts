import type { GetCampaignFiltersResponseDto } from "./campaign-filter.dto";
import type {
    CampaignFilterSection,
    CampaignFiltersRequestBody,
} from "../model/campaign-filter.types";
import { mapCampaignFilterSectionDto } from "../model/campaign-filter.mappers";
import $api from "@/api/api.ts";


export const getCampaignFilters = async (
    body: CampaignFiltersRequestBody,
): Promise<CampaignFilterSection[]> => {
    const response = await $api.post<GetCampaignFiltersResponseDto>(
        "/profile/filters",
        body,
    );

    const items = response.data?.data?.filterArr ?? [];
    return items.map(mapCampaignFilterSectionDto);
};