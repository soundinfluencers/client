import React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";

import styles from "./table.module.scss";
import plus from '@/assets/icons/plus.svg'
import {Link, useSearchParams} from "react-router-dom";
import type {CampaignStatus} from "@/entities/client-side/dashboard/model/campaign.types.ts";
import type {StrategyGroup} from "@/widgets/client-side/campaign-tables/model/campaign-strategy.types.ts";
interface TableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    isManualPagination?: boolean;
    isFetching?: boolean;
    emptyText?: string;
    canEdit?: boolean;
    canManageAccounts?: boolean;
    totalPrice?: number;
    totalFollowers?: number;
    optionIndex?: number;
    getRowKey?: (row: TData) => string;
    highlightedRowKeys?: string[];
    deletingRowKey?: string | null;
    group: StrategyGroup;
    currency?: string;
}

export function TableCampaign<TData>({
                                         data,
                                         columns,
                                         isManualPagination = false,
                                         isFetching = false,
                                         emptyText = "No data available",
                                         canEdit = false,
                                         totalPrice = 0,
                                         totalFollowers = 0,
                                         optionIndex = 0,
                                         getRowKey,
                                         highlightedRowKeys = [],
                                         deletingRowKey = null,
                                         canManageAccounts,
                                         group,
                                         currency
                                     }: TableProps<TData>) {
    "use no memo";
    const [searchParams] = useSearchParams();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const campaignId = searchParams.get("id");
    const statusParam = searchParams.get("status") as CampaignStatus | null;

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
                                const isAdded = !!rowKey && highlightedRowKeys.includes(rowKey);
                                const isDeleting = !!rowKey && deletingRowKey === rowKey;


                                const rowClassName = [
                                    styles.tr,
                                    isAdded ? styles.rowAdded : "",
                                    isDeleting ? styles.rowDeleting : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <tr key={row.id} className={rowClassName}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={styles.td}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                        </tbody>

                        <tfoot className={styles.footer}>
                        <tr>
                            {table.getFlatHeaders().map((header, index) => (
                                <td
                                    key={header.id}
                                    className={`${styles.tdFooter} ${canEdit && index === 0 ? styles.influencerButton : ""} ${index === 1 ? styles.followerBorder : ""} ${styles.noBorder}`}
                                    style={{ width: header.getSize() }}
                                >
                                    {index === 0 &&
                                        (canManageAccounts ? (
                                            <Link
                                                to={`/dashboard/campaigns/campaign-management/add-account?id=${campaignId}&status=${statusParam}&optionIndex=${optionIndex}`}
                                                className={styles.iconWrapper}
                                            >
                                                <img src={plus} alt="" />
                                                Add influencer
                                            </Link>
                                        ) : (
                                            <span>Price: {totalPrice}{currency ?? "€"}</span>
                                        ))}

                                    {index === 1 && group !== 'press' ? <span>{totalFollowers}</span> : null}
                                </td>
                            ))}
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}