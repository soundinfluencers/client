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
    isBespoke?: boolean;
};

export type AgencyCampaignFormConfig = {
    tabId: AgencyCampaignTabId;
    title: string;
    fields: AgencyFormField[];

};

export type AgencyCurrency = "EUR" | "USD" | "GBP";

export type AgencyPayloadBase = {
    campaignGoal: string;
    contentLink: string;
    budget: number;
    currency: AgencyCurrency;
    targetTerritories: string;
    extraBriefs: string;
    trackLink: string;
    releaseDate: string;
    smartLink: string;
    ticketLink: string;
    brief: string;
};

export type AgencyCampaignPayload =
    | {
    category: "artist";
    payload: Partial<
        Pick<
            AgencyPayloadBase,
            | "campaignGoal"
            | "contentLink"
            | "budget"
            | "currency"
            | "targetTerritories"
            | "extraBriefs"
        >
    >;
}
    | {
    category: "music";
    payload: Partial<
        Pick<
            AgencyPayloadBase,
            | "campaignGoal"
            | "contentLink"
            | "trackLink"
            | "releaseDate"
            | "smartLink"
            | "budget"
            | "currency"
            | "targetTerritories"
            | "extraBriefs"
        >
    >;
}
    | {
    category: "event";
    payload: Partial<
        Pick<
            AgencyPayloadBase,
            | "campaignGoal"
            | "contentLink"
            | "ticketLink"
            | "budget"
            | "currency"
            | "targetTerritories"
            | "extraBriefs"
        >
    >;
}
    | {
    category: "other";
    payload: Partial<Pick<AgencyPayloadBase, "brief">>;
};