import type { CampaignPageData, LastCampaignSession } from "./campaign-page.types";
import type {
  CreateProposalOptionResult,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import {
  isCreatedProposalOptionForCampaign,
} from "@/entities/client-side/campaign/model/proposal-option-response.ts";

export const getCampaignActionId = (data: CampaignPageData): string => {
  if (!data) return "";
  return data.kind === "draft" ? String(data.draftId ?? "") : String(data.campaignId ?? "");
};

export const getCurrentDataId = (data: CampaignPageData): string => {
  if (!data) return "";
  return data.kind === "draft" ? String(data.draftId ?? "") : String(data.campaignId ?? "");
};

export const getOptionIndexes = (
  data: CampaignPageData,
  localExtraOptions: number[],
): number[] => {
  if (data?.kind !== "proposal") return [];

  return Array.from(
    new Set([...(data.existingOptions ?? []), ...localExtraOptions]),
  ).sort((a, b) => a - b);
};

export const getBarComponentKind = (data: CampaignPageData) => {
  const isBarSection =
    data?.kind === "regular" &&
    ["distributing", "completed"].includes(data?.status);

  return {
    isBarSection,
    showBar:
      data?.kind === "regular" ||
      data?.kind === "proposal" ||
      data?.kind === "draft",
  };
};

export const parseLastCampaignSession = (): LastCampaignSession | null => {
  const raw = sessionStorage.getItem("lastCampaign");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LastCampaignSession;
  } catch {
    return null;
  }
};

export const writeLastProposalOptionSession = ({
  campaignId,
  optionIndex,
}: {
  campaignId: string;
  optionIndex: number;
}) => {
  sessionStorage.setItem(
    "lastCampaign",
    JSON.stringify({
      id: campaignId,
      status: "proposal",
      optionIndex,
    } satisfies LastCampaignSession),
  );
};

export const isValidCreatedProposalOption = (
  response: CreateProposalOptionResult,
  currentCampaignId: string,
): boolean => isCreatedProposalOptionForCampaign(response, currentCampaignId);

const APP_ORIGIN = import.meta.env.DEV
  ? "https://test.soundinfluencers.com"
  : "https://go.soundinfluencers.com/m";


export const buildPromoShareUrl = (campaignId: string) => {
  const origin = APP_ORIGIN;
  const id = encodeURIComponent(campaignId);

  return `${origin}/promo-share/${id}/proposal`;
};

export const buildShareUrl = (
  campaignId: string,
  socialMedia: string,
) => {
  const origin = APP_ORIGIN;
  const id = encodeURIComponent(campaignId);
  const media = encodeURIComponent(socialMedia);

  return `${origin}/promo-share/${id}/${media}`;
};
export const isLockedStatus = (status?: string) =>
  status === "distributing" || status === "completed";

export const getNextActiveOptionAfterDelete = ({
  activeOption,
  deletedOption,
  existingOptions,
}: {
  activeOption: number;
  deletedOption: number;
  existingOptions: number[];
}): number | null => {
  const normalizedOptions = Array.from(new Set(existingOptions)).sort(
    (a, b) => a - b,
  );
  const isContiguous = normalizedOptions.every(
    (optionIndex, index) => optionIndex === index,
  );

  if (
    normalizedOptions.length <= 1 ||
    !isContiguous ||
    !normalizedOptions.includes(activeOption) ||
    !normalizedOptions.includes(deletedOption)
  ) {
    return null;
  }

  const lastIndexAfterDelete = normalizedOptions.length - 2;

  if (activeOption === deletedOption) {
    return Math.min(deletedOption, lastIndexAfterDelete);
  }

  if (activeOption > deletedOption) {
    return Math.min(activeOption - 1, lastIndexAfterDelete);
  }

  return Math.min(activeOption, lastIndexAfterDelete);
};
