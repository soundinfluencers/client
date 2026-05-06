import type { CampaignListItemDto } from "../api/campaign.types";
import type { CampaignListItem } from "../model/campaign.types";

export const mapCampaignListItemDto = (
    dto: CampaignListItemDto,
): CampaignListItem => ({
    id: dto._id,
    campaignName: dto.campaignName,
    socialMedia: dto.socialMedia,
    creationDate: dto.creationDate,
    price: Number(dto.price ?? 0),
    status: dto.status,
    draftStep: dto.draftStep,
});