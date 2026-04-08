import type {ColumnWidths, DropdownKey, TableMode, TableVariant} from "../types/table-types";
import type { TableGroup } from "@/client-side/types/table-types";

export const columns = [
    "network",
    "followers",
    "postlink",
    "screenshot",
    "impressions",
    "likes",
    "comments",
    "saves",
    "shares",
] as const;

export const columnsStrategy = [
    "network",
    "followers",
    "date",
    "content",
    "description",
    "tag",
    "link",
    "brief",
] as const;

export const columnsProposals = [
    "network",
    "followers",
    "genres",
    "countries",
    "content",
    "description",
    "action",
] as const;

export const getColumnsStrategy = (flag: boolean) => {
    return flag ? columnsProposals : columnsStrategy;
};

export const getWidthColumn = (flag: boolean, isProposal: boolean) => {
    return flag
        ? {
            network: 185,
            followers: 96,
            genres: 300,
            countries: 300,
            content: 180,
            description: 210,
            artworkLink: 220,
            link: 220,
            tracktitle: 200,
        }
        : isProposal
            ? {
                network: 185,
                followers: 96,
                date: 120,
                content: 180,
                description: 270,
                artworkLink: 220,
                link: 220,
                tracktitle: 270,
                brief: 260,
                action: 66,
            }
            : {
                network: 185,
                followers: 96,
                date: 120,
                content: 180,
                description: 311,
                artworkLink: 220,
                link: 220,
                tag: 160,
                brief: 260,
                tracktitle: 200,
            };
};

type ColumnKey = string;

const baseTitles: Record<string, string> = {
    network: "Networks",
    followers: "Followers",
    postlink: "Post link",
    screenshot: "Screenshot",
    impressions: "Impressions",
    likes: "Likes",
    genres: "Genres",
    countries: "Top 5 Countries",
    comments: "Comments",
    saves: "Saves",
    shares: "Shares",
    date: "Req. date",
    content: "Content",
    description: "Post description",
    tag: "Story tag",
    link: "Story link",
    tracklink: "Track link",
    tracktitle: "Track Title",
    brief: "Additional brief",
    action: "Actions",
    pressLink: "Link to press release",
    artworkLink: "Artwork Link",
};

const titlesByGroup: Partial<
    Record<TableGroup, Partial<Record<string, string>>>
> = {
    main: {
        description: "Post description",
        tag: "Story tag",
        link: "Story link",
    },
    music: {
        content: "Track link",
        tracktitle: "Track Title",
    },
    press: {
        content: "Link to music, events, news",
        artworkLink: "Link to artwork & press shots",
        taggedLink: "link to press release",
        brief: "Additional brief",
    },
};

export const getTitle = (group: TableGroup, key: string) =>
    titlesByGroup[group]?.[key] ?? baseTitles[key] ?? key;

export const ReqData = ["ASAP", "BEFORE", "AFTER"] as const;

export const getDropdownOptions = (key: DropdownKey): string[] => {
    switch (key) {
        case "date":
            return [...ReqData];
        default:
            return [];
    }
};

export const titles: Record<string, string> = {
    network: "Networks",
    followers: "Followers",
    postlink: "Post link",
    screenshot: "Screenshot",
    impressions: "Impressions",
    likes: "Likes",
    genres: "Genres",
    countries: "Top 5 Countries",
    comments: "Comments",
    saves: "Saves",
    shares: "Shares",
    date: "Req. date",
    content: "Content",
    description: "Post description",
    tag: "Story tag",
    link: "Story link",
    tracklink: "Track link",
    pressLink: "Link to press release",
    tracktitle: "Track Title",
    brief: "Additional brief",
    action: "Actions",
    artworkLink: "Artwork Link",
};

export const TABLE_COLUMN_WIDTHS: Record<
    TableMode,
    Record<TableVariant, Record<TableGroup, ColumnWidths>>
> = {
    default: {
        readonly: {
            main: {
                network: 208,
                followers: 96,
                date: 98,
                content: 141,
                description: 299,
                tag: 113,
                link: 125,
                brief: 142,
            },
            music: {
                network: 185,
                followers: 96,
                date: 120,
                content: 180,
                tracktitle: 200,
                brief: 260,
            },
            press: {
                network: 185,
                date: 120,
                content: 180,
                artworkLink: 220,
                pressLink: 220,
                brief: 260,
            },
        },

        editable: {
            main: {
                network: 208,
                followers: 96,
                date: 98,
                content: 141,
                description: 230,
                tag: 113,
                link: 125,
                brief: 121,
                action: 66,
            },
            music: {
                network: 185,
                followers: 96,
                date: 120,
                content: 150,
                tracktitle: 270,
                brief: 260,
                action: 66,
            },
            press: {
                network: 185,
                date: 120,
                content: 150,
                artworkLink: 220,
                pressLink: 220,
                brief: 260,
                action: 66,
            },
        },
    },

    changeView: {
        readonly: {
            main: {
                network: 185,
                followers: 96,
                genres: 283,
                countries: 277,
                content: 180,
                description: 200,
            },
            music: {
                network: 185,
                followers: 96,
                genres: 300,
                content: 180,
                tracktitle: 200,
            },
            press: {
                network: 185,
                genres: 663,
                brief: 257,
            },
        },

        editable: {
            main: {
                network: 185,
                followers: 96,
                genres: 283,
                countries: 277,
                content: 180,
                description: 200,

            },
            music: {
                network: 185,
                followers: 96,
                genres: 300,
                content: 180,
                tracktitle: 200,

            },
            press: {
                network: 185,
                genres: 663,
                brief: 257,

            },
        },
    },
};

export const getTableColumnWidths = ({
                                         group,
                                         changeView,
                                         canEdit,
                                     }: {
    group: TableGroup;
    changeView: boolean;
    canEdit: boolean;
}): ColumnWidths => {
    const mode: TableMode = changeView ? "changeView" : "default";
    const variant: TableVariant = canEdit ? "editable" : "readonly";

    return TABLE_COLUMN_WIDTHS[mode][variant][group] ?? {};
};