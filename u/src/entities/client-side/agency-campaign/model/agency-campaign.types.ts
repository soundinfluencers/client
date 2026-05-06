export type AgencyCampaignTabId = "artist" | "music" | "event" | "other";

export type AgencyCampaignCategory =
    | "artist"
    | "music"
    | "event"
    | "other";

export type AgencyFormValues = Record<string, string>;

export type AgencyTabItem = {
    id: AgencyCampaignTabId;
    label: string;
    icon: string;
};

export type AgencyFormField = {
    name: string;
    label?: string;
    placeholder: string;
    required?: boolean;
    type?: "text" | "textarea" | "budget";
};

export type AgencyCampaignFormConfig = {
    tabId: AgencyCampaignTabId;
    title: string;
    fields: AgencyFormField[];
};

export type AgencyCampaignPayload =
    | {
    category: "artist";
    payload: {
        campaignGoal: string;
        contentLink: string;
        budget: number;
        currency: "EUR" | "USD" | "GBP";
        targetTerritories: string;
        extraBriefs: string;
    };
}
    | {
    category: "music";
    payload: {
        campaignGoal: string;
        contentLink: string;
        trackLink: string;
        releaseDate: string;
        smartLink: string;
        budget: number;
        currency: "EUR" | "USD" | "GBP";
        targetTerritories: string;
        extraBriefs: string;
    };
}
    | {
    category: "event";
    payload: {
        campaignGoal: string;
        contentLink: string;
        ticketLink: string;
        budget: number;
        currency: "EUR" | "USD" | "GBP";
        targetTerritories: string;
        extraBriefs: string;
    };
}
    | {
    category: "other";
    payload: {
        brief: string;
    };
};