import type { AgencyCampaignPayload } from "../model/agency-campaign.types";

export type PostAgencyCampaignRequestDto = AgencyCampaignPayload;

export type PostAgencyCampaignResponseDto = {
    statusCode?: number;
    message?: string;
};