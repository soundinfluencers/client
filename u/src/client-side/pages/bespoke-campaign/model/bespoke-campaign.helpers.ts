import type {
    BespokeCampaignCategory, BespokeCampaignTabData,
    BespokeCampaignTabId, BespokeFormValues
} from "@/client-side/pages/bespoke-campaign/model/bespoke-сampaign.types.ts";


export const mapTabToCategory = (
    tabId: BespokeCampaignTabId,
): BespokeCampaignCategory => {
    switch (tabId) {
        case "Artist":
            return "artist";
        case "Music":
            return "music";
        case "Event":
            return "event";
        case "Other":
        default:
            return "other";
    }
};

export const parseAmount = (value: unknown): number => {
    const normalized = String(value ?? "")
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    return normalized ? Number(normalized) : 0;
};

export const mapCurrencySymbolToCode = (symbol: string): "EUR" | "USD" | "GBP" => {
    if (symbol === "£") return "GBP";
    if (symbol === "$") return "USD";
    return "EUR";
};

export const getBespokeTabData = (
    tabs: BespokeCampaignTabData[],
    activeTabId: BespokeCampaignTabId,
) => {
    return tabs.find((item) => item.promoType === activeTabId) ?? null;
};
const removeEmptyFields = <T extends Record<string, unknown>>(obj: T) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => {
            if (value === null || value === undefined) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            return true;
        }),
    ) as Partial<T>;
};

export const buildBespokePayload = (
    category: BespokeCampaignCategory,
    values: BespokeFormValues,
) => {
    if (category === "other") {
        return removeEmptyFields({
            brief: values["Brief"],
        });
    }

    const budgetRaw = values["Your budget"];
    const currencyRaw = values["Your budget currency"];

    const common = removeEmptyFields({
        contentLink: values["Content available"],
        budget: budgetRaw ? parseAmount(budgetRaw) : undefined,
        currency: currencyRaw ? mapCurrencySymbolToCode(currencyRaw) : undefined,
        targetTerritories: values["Target territories"],
    });

    if (category === "artist") {
        return removeEmptyFields({
            ...common,
            campaignGoal: values["Campaign objective"],
            extraBriefs: values["Any Extra Briefs"],
        });
    }

    if (category === "music") {
        return removeEmptyFields({
            ...common,
            campaignGoal: values["Campaign objective"],
            trackLink: values["Download or private link to the track"],
            releaseDate: values["Release date"],
            smartLink: values["Enter linkfire / smartlink"],
            extraBriefs:
                values["Any extra notes (messaging, influencer type, content ideas)"],
        });
    }

    return removeEmptyFields({
        ...common,
        campaignGoal: values["What you’re promoting (Campaign Goal)"],
        ticketLink: values["Ticket link"],
        extraBriefs:
            values["Any extra notes (messaging, influencer type, content ideas)"],
    });
};