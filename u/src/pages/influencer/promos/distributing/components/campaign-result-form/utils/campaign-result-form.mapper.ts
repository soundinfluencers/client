import type { TCampaignInfo, ICampaignResultFormData, TCampaignResultDTO } from "../types/campaign-result-form.types";

export const campaignResultMapper = (
  formPayload: TCampaignInfo,
  data: ICampaignResultFormData
): TCampaignResultDTO => ({
  ...formPayload,
  data: data,
});