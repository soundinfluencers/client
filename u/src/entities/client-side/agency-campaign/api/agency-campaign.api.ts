import $api from "@/api/api";
import type {
    PostAgencyCampaignRequestDto,
    PostAgencyCampaignResponseDto,
} from "./agency-campaign.types";

export const postAgencyCampaign = async (
    body: PostAgencyCampaignRequestDto,
) => {
    const response = await $api.post<PostAgencyCampaignResponseDto>(
        "/campaigns/bespoke",
        body,
        {
            headers: { "Content-Type": "application/json" },
        },
    );

    return response.data;
};