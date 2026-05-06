import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from "@tanstack/react-table";
import styles from "./table.module.scss";
import React from "react";
import { Link } from "react-router-dom";
import plus from '@/assets/icons/plus.svg'

interface InsightTotals {
    followers?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    saves?: number;
    shares?: number;
}

interface TableInsightProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    isManualPagination?: boolean;
    isFetching?: boolean;
    emptyText?: string;
    getRowKey?: (row: TData) => string;
    totals?: InsightTotals;
    canManageAccounts?: boolean;
    campaignId?: string;
    statusParam?: string | null;
    optionIndex?: number;
    totalPrice?: number
}

export function TableCampaignInsight<TData>({
                                                data,
                                                columns,
                                                isManualPagination = false,
                                                isFetching = false,
                                                emptyText = "No data available",
                                                getRowKey,
                                                totals,
                                                canManageAccounts = false,
                                                campaignId = "",
                                                statusParam = null,
                                                optionIndex = 0,
                                                totalPrice
                                            }: TableInsightProps<TData>) {
    "use no memo";

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: isManualPagination,
    });

    const rows = table.getRowModel().rows;

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.scrollWrapper}>
                <div className={styles.tableInner}>
                    {isFetching && rows.length > 0 && <div className={styles.overlay} />}

                    <table className={styles.table}>
                        <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={styles.th}
                                        style={{ width: header.getSize() }}
                                    >
                                        <div className={styles.headCell}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>

                        <tbody className={styles.tbody}>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.stateCell}>
                                    {isFetching ? "Loading..." : emptyText}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const rowData = row.original;
                                const rowKey = getRowKey ? getRowKey(rowData) : "";

                                return (
                                    <tr key={rowKey || row.id} className={styles.tr}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={styles.td}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                        </tbody>

                        <tfoot className={styles.footer}>
                        <tr>
                            {table.getFlatHeaders().map((header, index) => {
                                const columnId = header.id;

                                return (
                                    <td
                                        key={header.id}
                                        className={`${styles.td} ${styles.noBorder} ${canManageAccounts && index === 0 ? styles.influencerButton : ""}`}
                                        style={{ width: header.getSize() }}
                                    >
                                        {columnId === "network" &&
                                            (canManageAccounts ? (
                                                <Link
                                                    to={`/dashboard/campaigns/campaign-management/add-account?id=${campaignId}&status=${statusParam}&optionIndex=${optionIndex}`}
                                                    className={styles.iconWrapper}
                                                >
                                                    <img src={plus} alt="" />
                                                    Add influencer
                                                </Link>
                                            ) : (
                                                <span>Price: {totalPrice}€</span>
                                            ))}

                                        {columnId === "followers" && (
                                            <span>{totals?.followers ?? 0}</span>
                                        )}
                                        {columnId === "impressions" && (
                                            <span>{totals?.impressions ?? 0}</span>
                                        )}
                                        {columnId === "likes" && (
                                            <span>{totals?.likes ?? 0}</span>
                                        )}
                                        {columnId === "comments" && (
                                            <span>{totals?.comments ?? 0}</span>
                                        )}
                                        {columnId === "saves" && (
                                            <span>{totals?.saves ?? 0}</span>
                                        )}
                                        {columnId === "shares" && (
                                            <span>{totals?.shares ?? 0}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}