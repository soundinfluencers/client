import type { CampaignKind } from "@/entities/client-side/campaign/store/campaign.store";
import type { CampaignTableMode, CampaignView } from "./campaign-view.types";

export const CAMPAIGN_TABLE_MODE_PARAM = "mode";
export const CAMPAIGN_VIEW_PARAM = "view";
export const CAMPAIGN_ADVANCED_INSIGHTS_PARAM = "advanced";

export const normalizeTableMode = ({
                                       value,
                                       kind,
                                   }: {
    value: unknown;
    kind?: CampaignKind | null;
}): CampaignTableMode => {
    if (kind === "proposal") return "strategy";

    if (value === "strategy" || value === "insight") {
        return value;
    }

    return "insight";
};

export const normalizeCampaignView = ({
                                          value,
                                          kind,
                                          canEdit,
                                      }: {
    value: unknown;
    kind?: CampaignKind | null;
    canEdit?: boolean;
}): CampaignView => {
    const raw = Number(value);

    if (kind === "proposal") {
        if (raw === -1 && canEdit) return -1;
        if (raw === 0 || raw === 1) return raw;

        return canEdit ? -1 : 0;
    }

    if (raw === 0 || raw === 1) return raw;

    return 1;
};

export const normalizeAdvancedInsights = (value: unknown): boolean => {
    return value === "1" || value === "true";
};