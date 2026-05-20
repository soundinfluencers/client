import type { CampaignPageData, LastCampaignSession } from "./campaign-page.types";

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

export const buildPromoShareUrl = (campaignId: string) => {
    const origin = "https://go.soundinfluencers.com";
    const id = encodeURIComponent(campaignId);

    return `${origin}/promo-share/${id}/proposal`;
};

export const buildShareUrl = (
    campaignId: string,
    socialMedia: string,
) => {
    const origin = "https://go.soundinfluencers.com";
    const id = encodeURIComponent(campaignId);
    const media = encodeURIComponent(socialMedia);

    return `${origin}/promo-share/${id}/${media}`;
};
export const isLockedStatus = (status?: string) =>
    status === "distributing" || status === "completed";