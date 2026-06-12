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
import plus from "@/assets/icons/plus.svg";
import { useLocation, useNavigate } from "react-router-dom";

import type { StrategyGroup } from "@/widgets/client-side/campaign-tables/model/campaign-strategy.types.ts";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {getCurrencySymbol} from "@/widgets/client-side/campaign/campaign-bar/model/campaign-bar.helpers.ts";

type FooterMode = "strategy" | "insight";

type MetricKey =
    | "followers"
    | "impressions"
    | "likes"
    | "comments"
    | "saves"
    | "shares";

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
    footerMode?: FooterMode;
}

const getAccountFromRow = (row: any) => {
    return row?.account ?? row;
};

const getMetricValue = (row: any, key: MetricKey) => {
    const account = getAccountFromRow(row);

    if (key === "likes") {
        return Number(account?.like ?? 0);
    }

    return Number(account?.[key] ?? 0);
};

const getMetricTotal = <TData,>(data: TData[], key: MetricKey) => {
    return data.reduce((sum, row) => {
        return sum + getMetricValue(row, key);
    }, 0);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
};

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
                                         currency,
                                         footerMode = "strategy",
                                     }: TableProps<TData>) {
    "use no memo";

    const navigate = useNavigate();
    const location = useLocation();
    const resetBuilder = useCampaignBuilderStore((s) => s.actions.reset);

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: isManualPagination,
    });

    const rows = table.getRowModel().rows;

    const insightTotals = React.useMemo(
        () => ({
            followers:
                group !== "press"
                    ? getMetricTotal(data, "followers")
                    : 0,
            impressions: getMetricTotal(data, "impressions"),
            likes: getMetricTotal(data, "likes"),
            comments: getMetricTotal(data, "comments"),
            saves: getMetricTotal(data, "saves"),
            shares: getMetricTotal(data, "shares"),
        }),
        [data, group],
    );

    const onAddInfluencer = React.useCallback(() => {
        resetBuilder?.();

        const returnTo = encodeURIComponent(
            `${location.pathname}${location.search}`,
        );

        navigate(
            `/client/create-campaign?mode=add-influencer&option=${optionIndex}&returnTo=${returnTo}`,
        );
    }, [
        resetBuilder,
        navigate,
        optionIndex,
        location.pathname,
        location.search,
    ]);

    const getInsightFooterValue = React.useCallback(
        (columnId: string, index: number) => {
            if (index === 0) {
                return (
                    <span>
                        Price: {totalPrice}
                        {getCurrencySymbol(currency) ?? "€"}
                    </span>
                );
            }

            if (columnId === "followers" && group !== "press") {
                return <span>{formatNumber(insightTotals.followers)}</span>;
            }

            if (columnId === "impressions") {
                return <span>{formatNumber(insightTotals.impressions)}</span>;
            }

            if (columnId === "likes") {
                return <span>{formatNumber(insightTotals.likes)}</span>;
            }

            if (columnId === "comments") {
                return <span>{formatNumber(insightTotals.comments)}</span>;
            }

            if (columnId === "saves") {
                return <span>{formatNumber(insightTotals.saves)}</span>;
            }

            if (columnId === "shares") {
                return <span>{formatNumber(insightTotals.shares)}</span>;
            }

            return null;
        },
        [totalPrice, currency, group, insightTotals],
    );

    const getStrategyFooterValue = React.useCallback(
        (index: number) => {
            if (index === 0) {
                return canManageAccounts ? (
                    <button
                        type="button"
                        onClick={onAddInfluencer}
                        className={styles.iconWrapper}
                    >
                        <img src={plus} alt="" />
                        Add influencer
                    </button>
                ) : (
                    <span>
                        Price: {totalPrice}

                        {getCurrencySymbol(currency) ?? "€"}
                    </span>
                );
            }

            if (index === 1 && group !== "press") {
                return <span>{formatNumber(totalFollowers)}</span>;
            }

            return null;
        },
        [
            canManageAccounts,
            onAddInfluencer,
            totalPrice,
            currency,
            group,
            totalFollowers,
        ],
    );

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.scrollWrapper}>
                <div className={styles.tableInner}>
                    {isFetching && rows.length > 0 && (
                        <div className={styles.overlay} />
                    )}

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
                                                    header.column
                                                        .columnDef.header,
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
                                <td
                                    colSpan={columns.length}
                                    className={styles.stateCell}
                                >
                                    {isFetching ? "Loading..." : emptyText}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const rowData = row.original;
                                const rowKey = getRowKey
                                    ? getRowKey(rowData)
                                    : "";
                                const isAdded =
                                    !!rowKey &&
                                    highlightedRowKeys.includes(rowKey);
                                const isDeleting =
                                    !!rowKey && deletingRowKey === rowKey;

                                const rowClassName = [
                                    styles.tr,
                                    isAdded ? styles.rowAdded : "",
                                    isDeleting ? styles.rowDeleting : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <tr
                                        key={row.id}
                                        className={rowClassName}
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className={styles.td}
                                                >
                                                    {flexRender(
                                                        cell.column
                                                            .columnDef.cell,
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
                                const columnId = header.column.id;

                                return (
                                    <td
                                        key={header.id}
                                        className={`${styles.tdFooter} ${
                                            canEdit && index === 0
                                                ? styles.influencerButton
                                                : ""
                                        } ${
                                            index === 1
                                                ? styles.followerBorder
                                                : ""
                                        } ${styles.noBorder}`}
                                        style={{
                                            width: header.getSize(),
                                        }}
                                    >
                                        {footerMode === "insight"
                                            ? getInsightFooterValue(
                                                columnId,
                                                index,
                                            )
                                            : getStrategyFooterValue(index)}
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