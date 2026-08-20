import type { CampaignBriefDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";

export const getMissingRequiredBriefFields = (brief?: CampaignBriefDto) => [
  ...(!brief?.campaignGoal?.trim() ? ["campaign goal"] : []),
  ...(!(typeof brief?.budget === "number" && brief.budget > 0)
    ? ["approximate budget"]
    : []),
  ...(!brief?.genre?.trim() ? ["genre"] : []),
  ...(!brief?.platforms?.length ? ["platforms"] : []),
  ...(!brief?.countries?.length ? ["target countries or Worldwide"] : []),
  ...(!brief?.dateRequest?.trim() ? ["campaign timing or Flexible"] : []),
];

export const isRequiredBriefComplete = (brief?: CampaignBriefDto) =>
  getMissingRequiredBriefFields(brief).length === 0;
