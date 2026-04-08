import {
    buildMainCampaignContent,
    buildMusicCampaignContent,
    buildPressCampaignContent
} from "@/client-side/utils/prepare-campaign-content.ts";

export const getCampaignContentFromForm = (
    formData: Record<string, any>,
    selectedPlatforms: string[],
    grouped: Record<"main" | "music" | "press", string[]>,
) => {
    const campaignContent: any[] = [];

    (["main", "music", "press"] as const).forEach((group) => {
        grouped[group]?.forEach((platform) => {
            if (!selectedPlatforms.includes(platform)) return;

            if (group === "main") {
                campaignContent.push(...buildMainCampaignContent(formData, platform));
            }

            if (group === "music") {
                campaignContent.push(...buildMusicCampaignContent(formData, platform));
            }

            if (group === "press") {
                campaignContent.push(...buildPressCampaignContent(formData, platform));
            }
        });
    });

    return campaignContent;
};