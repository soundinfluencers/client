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

export const buildBespokePayload = (
    category: BespokeCampaignCategory,
    values: BespokeFormValues,
) => {
    if (category === "other") {
        return {
            brief: values["Brief"] ?? "",
        };
    }

    const budget = parseAmount(values["Your budget"]);
    const currency = mapCurrencySymbolToCode(
        values["Your budget currency"] ?? "€",
    );

    const common = {
        contentLink: values["Content available"] ?? "",
        budget,
        currency,
        targetTerritories: values["Target territories"] || ".",
    };

    if (category === "artist") {
        return {
            ...common,
            campaignGoal: values["Campaign objective"] ?? "",
            extraBriefs: values["Any Extra Briefs"] ?? "",
        };
    }

    if (category === "music") {
        return {
            ...common,
            campaignGoal: values["Campaign objective"] ?? "",
            trackLink: values["Download or private link to the track"] ?? "",
            releaseDate: values["Release date"] ?? "",
            smartLink: values["Enter linkfire / smartlink"] ?? "",
            extraBriefs:
                values["Any extra notes (messaging, influencer type, content ideas)"] ?? "",
        };
    }

    return {
        ...common,
        campaignGoal: values["What you’re promoting (Campaign Goal)"] ?? "",
        ticketLink: values["Ticket link"] ?? "",
        extraBriefs:
            values["Any extra notes (messaging, influencer type, content ideas)"] ?? "",
    };
};