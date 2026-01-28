import type { TCampaignInfo, ICampaignResultFormData, TCampaignResultDTO } from "../types/campaign-result-form.types";


const cleanObject = <T extends object>(obj: T): Partial<T> => {
  const out: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }

  return out as Partial<T>;
};

export const campaignResultMapper = (
  formPayload: TCampaignInfo,
  data: ICampaignResultFormData
): TCampaignResultDTO => ({
  ...formPayload,
  data: cleanObject(data),
});