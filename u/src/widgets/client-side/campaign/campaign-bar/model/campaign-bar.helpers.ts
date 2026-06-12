import type { EditableCampaign } from "@/entities/client-side/campaign/store/campaign.store";

export type CampaignBarMode = "strategy" | "insight";

export const normalizeCampaignStatus = (status?: string | null) => {
    return String(status ?? "").trim().toLowerCase();
};

export const getCampaignBarMode = (
    campaign: EditableCampaign | null,
): CampaignBarMode => {
    const status = normalizeCampaignStatus(campaign?.status);

    if (status === "proposal" || status === "under_review") return "strategy";

    return "insight";
};

export const formatFollowers = (value?: number | null) => {
    const num = Number(value ?? 0);

    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1).replace(".0", "")}M`;
    }

    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1).replace(".0", "")}K`;
    }

    return String(num);
};

export const formatCampaignDate = (value?: string | null) => {
    if (!value) return "—";

    return String(value);
};

export const getCurrencySymbol = (currency?: string | null) => {
    switch (String(currency ?? "").toUpperCase()) {
        case "EUR":
            return "€";
        case "USD":
            return "$";
        case "GBP":
            return "£";
        default:
            return String(currency ?? "");
    }
};

export const getCampaignBudget = (campaign: EditableCampaign | null) => {
    return Number(campaign?.price ?? 0);
};

export const getAccountsFollowers = (campaign: EditableCampaign | null) => {
    return (campaign?.addedAccounts ?? []).reduce((sum, account) => {
        return sum + Number(account.followers ?? 0);
    }, 0);
};

export const getCampaignReach = (campaign: EditableCampaign | null) => {
    const status = normalizeCampaignStatus(campaign?.status);

    if (campaign?.kind === "proposal" || status === "proposal") {
        return getAccountsFollowers(campaign);
    }

    return Number(campaign?.totalFollowers ?? 0);
};

export const getResultCPM = (cpm?: number | null) => {
    const value = Number(cpm ?? 0);

    if (!value || value <= 0) return "";
    if (value < 3) return "Excellent";
    if (value < 5) return "Highly Above Average";
    if (value < 9) return "Above Average";
    if (value < 12) return "Average";

    return "Low Average";
};