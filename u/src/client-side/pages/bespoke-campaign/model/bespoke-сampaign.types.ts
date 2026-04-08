export type BespokeCampaignTabId = "Artist" | "Music" | "Event" | "Other";

export type BespokeCampaignCategory =
    | "artist"
    | "music"
    | "event"
    | "other";

export type BespokeFormValues = Record<string, string>;

export type BespokeTabItem = {
    id: BespokeCampaignTabId;
    label: string;
    icon: string;
};

export type BespokeFormField = {
    label?: string;
    name: string;
    placeholder: string;
};

export type BespokeCampaignTabData = {
    formType: "bespoke";
    promoType: BespokeCampaignTabId;
    title: string;
    inputs: BespokeFormField[];
    textAreas: BespokeFormField[];
};

export type BespokeCampaignRequestPayload = {
    category: BespokeCampaignCategory;
    payload: Record<string, unknown>;
};