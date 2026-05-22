import type {
    AgencyCampaignCategory,
    AgencyCampaignPayload,
    AgencyCampaignTabId,
    AgencyFormValues,
} from "./agency-campaign.types";

export const mapTabToCategory = (
    tabId: AgencyCampaignTabId,
): AgencyCampaignCategory => {
    return tabId;
};

export const parseAmount = (value: unknown): number => {
    const normalized = String(value ?? "")
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    return normalized ? Number(normalized) : 0;
};

export const mapCurrencySymbolToCode = (
    symbol: string,
): "EUR" | "USD" | "GBP" => {
    if (symbol === "£") return "GBP";
    if (symbol === "$") return "USD";
    return "EUR";
};
const removeEmptyFields = <T extends Record<string, unknown>>(obj: T) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => {
            if (value === null || value === undefined) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            return true;
        }),
    );
};
export const buildAgencyCampaignPayload = (
    category: AgencyCampaignCategory,
    values: AgencyFormValues,
): AgencyCampaignPayload => {
    if (category === "other") {
        return {
            category,
            payload: removeEmptyFields({
                brief: values["Brief"],
            }),
        };
    }

    const budget = parseAmount(values["Your budget"]);
    const currency = mapCurrencySymbolToCode(
        values["Your budget currency"] ?? "€",
    );

    const common = removeEmptyFields({
        contentLink: values["Content available"],
        budget: budget > 0 ? budget : undefined,
        currency: budget > 0 ? currency : undefined,
        targetTerritories: values["Target territories"],
    });

    if (category === "artist") {
        return {
            category,
            payload: removeEmptyFields({
                ...common,
                campaignGoal: values["Campaign objective"],
                extraBriefs: values["Any Extra Briefs"],
            }),
        };
    }

    if (category === "music") {
        return {
            category,
            payload: removeEmptyFields({
                ...common,
                campaignGoal: values["Campaign objective"],
                trackLink: values["Download or private link to the track"],
                releaseDate: values["Release date"],
                smartLink: values["Enter linkfire / smartlink"],
                extraBriefs:
                    values["Any extra notes (messaging, influencer type, content ideas)"],
            }),
        };
    }

    return {
        category,
        payload: removeEmptyFields({
            ...common,
            campaignGoal: values["What you’re promoting (Campaign Goal)"],
            ticketLink: values["Ticket link"],
            extraBriefs:
                values["Any extra notes (messaging, influencer type, content ideas)"],
        }),
    };
};