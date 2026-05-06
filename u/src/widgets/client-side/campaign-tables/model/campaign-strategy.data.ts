import type { StrategyGroup, StrategyMode } from "./campaign-strategy.types";

export type StrategyColumnKey =
    | "network"
    | "followers"
    | "date"
    | "content"
    | "description"
    | "tag"
    | "link"
    | "brief"
    | "tracktitle"
    | "pressLink"
    | "artworkLink"
    | "genres"
    | "countries"
    | "action";

const COLUMN_TITLES: Record<StrategyColumnKey, string> = {
    network: "Networks",
    followers: "Followers",
    date: "Req. date",
    content: "Content",
    description: "Post description",
    tag: "Story tag",
    link: "Story link",
    brief: "Additional brief",
    tracktitle: "Track title",
    pressLink: "Link to press release",
    artworkLink: "Link to artwork & press shots",
    genres: "Genres",
    countries: "Countries",
    action: "Actions",
};

const GROUP_TITLES: Partial<
    Record<StrategyGroup, Partial<Record<StrategyColumnKey, string>>>
> = {
    music: {
        content: "Track link",
        tracktitle: "Track title",
    },
    press: {
        content: "Link to music, events, news",
        artworkLink: "Link to artwork & press shots",
        pressLink: "Link to press release",
    },
};

export const getColumnTitle = (
    group: StrategyGroup,
    key: StrategyColumnKey,
) => GROUP_TITLES[group]?.[key] ?? COLUMN_TITLES[key];

const DEFAULT_COLUMNS: Record<
    StrategyMode,
    Record<StrategyGroup, StrategyColumnKey[]>
> = {
    readonly: {
        main: ["network", "followers", "date", "content", "description", "tag", "link", "brief"],
        music: ["network", "followers", "date", "content", "tracktitle", "brief"],
        press: ["network", "date", "content", "artworkLink", "pressLink", "brief"],
    },
    readonlyDate: {
        main: ["network", "followers", "date", "content", "description", "tag", "link", "brief"],
        music: ["network", "followers", "date", "content", "tracktitle", "brief"],
        press: ["network", "date", "content", "artworkLink", "pressLink", "brief"],
    },
    edit: {
        main: ["network", "followers", "date", "content", "description", "tag", "link", "brief", "action"],
        music: ["network", "followers", "date", "content", "tracktitle", "brief", "action"],
        press: ["network", "date", "content", "artworkLink", "pressLink", "brief", "action"],
    },
};

const INSIGHTS_COLUMNS: Record<
    StrategyMode,
    Record<StrategyGroup, StrategyColumnKey[]>
> = {
    readonly: {
        main: ["network", "followers", "content", "description","genres", "countries",],
        music: ["network", "followers", "content", "tracktitle", "genres"],
        press: ["network", "brief", "genres"],
    },
    readonlyDate: {
        main: ["network", "followers", "content", "description","genres", "countries",],
        music: ["network", "followers", "content", "tracktitle", "genres"],
        press: ["network", "brief", "genres"],
    },
    edit: {
        main: ["network", "followers", "content", "description","genres", "countries",],
        music: ["network", "followers", "content", "tracktitle", "genres"],
        press: ["network", "brief", "genres"],
    },
};

const DEFAULT_WIDTHS: Record<
    StrategyMode,
    Record<StrategyGroup, Partial<Record<StrategyColumnKey, number>>>
> = {
    readonly: {
        main: { network: 208, followers: 96, date: 98, content: 141, description: 299, tag: 113, link: 125, brief: 142 },
        music: { network: 185, followers: 96, date: 120, content: 180, tracktitle: 220, brief: 260 },
        press: { network: 185, date: 120, content: 180, artworkLink: 220, pressLink: 220, brief: 260 },
    },
    readonlyDate: {
        main: { network: 208, followers: 96, date: 98, content: 141, description: 299, tag: 113, link: 125, brief: 142 },
        music: { network: 185, followers: 96, date: 120, content: 180, tracktitle: 220, brief: 260 },
        press: { network: 185, date: 120, content: 180, artworkLink: 220, pressLink: 220, brief: 260 },
    },
    edit: {
        main: { network: 208, followers: 96, date: 98, content: 141, description: 220, tag: 113, link: 125, brief: 121, action: 76 },
        music: { network: 185, followers: 96, date: 120, content: 150, tracktitle: 270, brief: 260, action: 66 },
        press: { network: 185, date: 120, content: 150, artworkLink: 220, pressLink: 220, brief: 260, action: 66 },
    },
};

const INSIGHTS_WIDTHS: Record<
    StrategyMode,
    Record<StrategyGroup, Partial<Record<StrategyColumnKey, number>>>
> = {
    readonly: {
        main: { network: 205, followers: 96, genres: 283, countries: 283, content: 131, description: 200 },
        music: { network: 205, followers: 96, content: 131, tracktitle: 200, genres: 589 },
        press: { network: 168, brief: 170, genres: 663 },
    },
    readonlyDate: {
        main: { network: 205, followers: 96, genres: 283, countries: 283, content: 131, description: 200 },
        music: { network: 205, followers: 96, content: 131, tracktitle: 200, genres: 589 },
        press: { network: 168, brief: 170, genres: 663 },
    },
    edit: {
        main: { network: 205, followers: 96, genres: 240, countries: 240, content: 131, description: 180, action: 76 },
        music: { network: 205, followers: 96, content: 131, tracktitle: 180, genres: 520, action: 66 },
        press: { network: 168, brief: 170, genres: 580, action: 66 },
    },
};

export const getStrategyColumns = ({
                                       group,
                                       mode,
                                       insights,
                                   }: {
    group: StrategyGroup;
    mode: StrategyMode;
    insights?: boolean;
}) => {
    return insights
        ? INSIGHTS_COLUMNS[mode][group]
        : DEFAULT_COLUMNS[mode][group];
};

export const getStrategyTableColumnWidths = ({
                                                 group,
                                                 mode,
                                                 insights,
                                             }: {
    group: StrategyGroup;
    mode: StrategyMode;
    insights?: boolean;
}) => {
    return insights
        ? INSIGHTS_WIDTHS[mode][group]
        : DEFAULT_WIDTHS[mode][group];
};