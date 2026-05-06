import type { ColumnDef } from "@tanstack/react-table";
import type {
    StrategyGroup,
    StrategyMode,
    StrategyRow,
    StrategyTableActions,
} from "../model/campaign-strategy.types";
import {
    getColumnTitle,
    getStrategyColumns,
    getStrategyTableColumnWidths,
    type StrategyColumnKey,
} from "../model/campaign-strategy.data";
import { NetworkCell } from "./cells/network-cell";
import { FollowersCell } from "./cells/followers-cell";
import { DateTableCell } from "./cells/date-cell";
import { ContentTableCell } from "./cells/content-table-cell";
import { DescriptionTableCell } from "./cells/description-table-cell";
import { ExtraFieldsTableCell } from "./cells/extra-fields-table-cell";
import { ActionTableCell } from "./cells/action-cell";
import { GenresCell } from "./cells/genres-cell";
import { CountriesCell } from "./cells/countries-cell";
import up from '../assets/Vector.svg'
import down from '../assets/chevron-down.svg'
import styles from "./sort-header.module.scss";

type Params = {
    group: StrategyGroup;
    mode: StrategyMode;
    actions?: StrategyTableActions;
    insights?: boolean;

};
const renderSortableHeader = (title: string, column: any) => {
    const sort = column.getIsSorted();

    return (
        <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className={`${styles.sortHeader} ${sort ? styles.sortHeaderActive : ""}`}
        >
            <span className={styles.sortTitle}>{title}</span>

            <span className={styles.sortIcons}>
                <img
                    src={up}
                    alt=""
                    className={`${styles.sortImage} ${sort === "asc" ? styles.sortImageActive : ""}`}
                />
                <img
                    src={down}
                    alt=""
                    className={`${styles.sortImage} ${sort === "desc" ? styles.sortImageActive : ""}`}
                />
            </span>
        </button>
    );
};

const createColumn = (
    key: StrategyColumnKey,
    group: StrategyGroup,
    width?: number,
    cell?: ColumnDef<StrategyRow>["cell"],
    extra?: Partial<ColumnDef<StrategyRow>>,
): ColumnDef<StrategyRow> => ({
    id: key,
    header: getColumnTitle(group, key),
    size: width,
    minSize: width,
    maxSize: width,
    cell,
    ...extra,
});

export const getCampaignStrategyColumns = ({
                                               group,
                                               mode,
                                               actions,
                                               insights = false,
                                           }: Params): ColumnDef<StrategyRow>[] => {
    const canEditDate = mode === "edit" || mode === "readonlyDate";
    const canSelectContent = mode === "edit" || mode === "readonlyDate";
    const canManageContent = mode === "edit";

    const keys = getStrategyColumns({ group, mode, insights });
    const widths = getStrategyTableColumnWidths({ group, mode, insights });

    const columnMap: Record<StrategyColumnKey, ColumnDef<StrategyRow>> = {
        network: createColumn("network", group, widths.network, ({ row }) => (
            <NetworkCell row={row.original} />
        )),

        followers: createColumn(
            "followers",
            group,
            widths.followers,
            ({ row }) => <FollowersCell row={row.original} />,
            {
                accessorFn: (row) => Number(row.account.followers ?? 0),
                enableSorting: true,
                header: ({ column }) =>
                    renderSortableHeader(getColumnTitle(group, "followers"), column),
            },
        ),

        date: createColumn("date", group, widths.date, ({ row }) => (
            <DateTableCell
                row={row.original}
                canEdit={canEditDate}
                setAccountDateRequest={actions?.setAccountDateRequest}
            />
        )),

        content: createColumn("content", group, widths.content, ({ row }) => (
            <ContentTableCell
                row={row.original}
                canSelect={canSelectContent}
                canManage={canManageContent}
                setAccountSelectedContent={actions?.setAccountSelectedContent}
                setContentField={actions?.setContentField}
                addContentItem={actions?.addContentItem}
                removeContentItem={actions?.removeContentItem}
            />
        )),

        description: createColumn("description", group, widths.description, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                canSelect={mode === "edit" || mode === "readonlyDate"}
                canManage={mode === "edit"}
                setAccountSelectedContent={actions?.setAccountSelectedContent}
                setContentDescriptions={actions?.setContentDescriptions}
            />
        )),

        tag: createColumn("tag", group, widths.tag, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                canEdit={canManageContent}
                field="tag"
                setContentField={actions?.setContentField}
            />
        )),

        link: createColumn("link", group, widths.link, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                canEdit={canManageContent}
                field="link"
                setContentField={actions?.setContentField}
            />
        )),

        brief: createColumn("brief", group, widths.brief, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                canEdit={canManageContent}
                field="brief"
                setContentField={actions?.setContentField}
            />
        )),

        tracktitle: createColumn("tracktitle", group, widths.tracktitle, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                canSelect={mode === "edit" || mode === "readonlyDate"}
                canManage={mode === "edit"}
                variant="tracktitle"
                setAccountSelectedContent={actions?.setAccountSelectedContent}
                setContentDescriptions={actions?.setContentDescriptions}
            />
        )),

        pressLink: createColumn("pressLink", group, widths.pressLink, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                canEdit={canManageContent}
                field="pressLink"
                setContentField={actions?.setContentField}
            />
        )),

        artworkLink: createColumn("artworkLink", group, widths.artworkLink, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                canSelect={mode === "edit" || mode === "readonlyDate"}
                canManage={mode === "edit"}
                variant="artworkLink"
                setAccountSelectedContent={actions?.setAccountSelectedContent}
                setContentDescriptions={actions?.setContentDescriptions}
            />
        )),

        action: createColumn("action", group, widths.action, ({ row }) => (
            <ActionTableCell
                row={row.original}
                canEdit={canManageContent}
                removeAccount={actions?.removeAccount}
                setDeletingAccountKey={actions?.setDeletingAccountKey}
                clearRecentlyAdded={actions?.clearRecentlyAdded}
                deletingAccountKey={actions?.deletingAccountKey}
                recentlyAddedAccountKeys={actions?.recentlyAddedAccountKeys ?? []}
            />
        )),
        genres: createColumn("genres", group, widths.genres, ({ row }) => (
            <GenresCell row={row.original} />
        )),

        countries: createColumn("countries", group, widths.countries, ({ row }) => (
            <CountriesCell row={row.original} />
        )),
    };

    return keys.map((key) => columnMap[key]);
};