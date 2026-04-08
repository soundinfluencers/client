import type { TableGroup } from "@/client-side/types/table-types";

type TableMode = "default" | "changeView";
type ColumnWidths = Partial<Record<string, number>>;

export const TABLE_COLUMN_WIDTHS: Record<
    TableMode,
    Record<TableGroup, ColumnWidths>
> = {
    default: {
        main: {
            network: 205,
            followers: 96,
            date: 113,
            content: 130,
            description: 190,
            tag: 113,
            link: 113,
            brief: 150,
        },

        music: {
            network: 205,
            followers: 96,
            date: 113,
            content: 160,
            tracktitle: 200,
            brief: 150,
        },

        press: {
            network: 205,
            date: 113,
            content: 190,
            artworkLink: 190,
            pressLink: 190,
            brief: 150,
        },
    },

    changeView: {
        main: {
            network: 205,
            followers: 96,
            genres: 283,
            countries: 283,
            content: 131,
            description: 200,
        },

        music: {
            network: 205,
            followers: 96,
            content: 131,
            tracktitle: 200,
            genres: 589,
        },

        press: {
            network: 168,
            brief: 170,
            genres: 663,
        },
    },
};

export const getTableColumnWidths = (
    group: TableGroup,
    changeView: boolean,
): ColumnWidths => {
    const mode: TableMode = changeView ? "changeView" : "default";
    return TABLE_COLUMN_WIDTHS[mode][group] ?? {};
};