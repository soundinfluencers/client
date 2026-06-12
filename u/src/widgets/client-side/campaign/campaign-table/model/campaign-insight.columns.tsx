import type { ColumnDef } from "@tanstack/react-table";
import type { CampaignTableRow, StrategyGroup } from "./campaign-table.types";

import { LinkCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/link-cell.tsx";
import { MetricCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/metric-cell.tsx";
import { SortableHeader } from "@/widgets/client-side/campaign/campaign-table/sortable-header/sortable-header";
import {NetworkTableCell} from "@/widgets/client-side/campaign/campaign-table/ui/cells/network-cell.tsx";
import {FollowersTableCell} from "@/widgets/client-side/campaign/campaign-table/ui/cells/followers-cell.tsx";

const sortableHeader = (title: string): ColumnDef<CampaignTableRow>["header"] => {
    return ({ column }) => (
        <SortableHeader<CampaignTableRow> title={title} column={column} />
    );
};

type GetInsightColumnsParams = {
    group: StrategyGroup;
};

export const getCampaignInsightColumns = ({
                                              group,
                                          }: GetInsightColumnsParams): ColumnDef<CampaignTableRow>[] => {
    const columns: ColumnDef<CampaignTableRow>[] = [
        {
            id: "network",
            header: "Network",
            size: 205,
            enableSorting: false,
            cell: ({ row }) => <NetworkTableCell row={row.original} />,
        },
    ];

    if (group !== "press") {
        columns.push({
            id: "followers",
            header: sortableHeader("Followers"),
            size: 96,
            accessorFn: (row) => Number(row.account.followers ?? 0),
            enableSorting: true,
            cell: ({ row }) => <FollowersTableCell row={row.original} />,
        });
    }

    columns.push(
        {
            id: "postLink",
            header: "Post link",
            size: 131,
            enableSorting: false,
            cell: ({ row }) => (
                <LinkCell url={row.original.account.postLink} type="link" />
            ),
        },
        {
            id: "screenshot",
            header: "Screenshot",
            size: 131,
            enableSorting: false,
            cell: ({ row }) => (
                <LinkCell url={row.original.account.screenshot} type="image" />
            ),
        },
        {
            id: "impressions",
            header: sortableHeader("Impressions"),
            size: 131,
            accessorFn: (row) => Number(row.account.impressions ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell value={row.original.account.impressions ?? 0} />
            ),
        },
        {
            id: "likes",
            header: sortableHeader("Likes"),
            size: 131,
            accessorFn: (row) => Number(row.account.like ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell value={row.original.account.like ?? 0} />
            ),
        },
        {
            id: "comments",
            header: sortableHeader("Comments"),
            size: 131,
            accessorFn: (row) => Number(row.account.comments ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell value={row.original.account.comments ?? 0} />
            ),
        },
        {
            id: "saves",
            header: sortableHeader("Saves"),
            size: 131,
            accessorFn: (row) => Number(row.account.saves ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell value={row.original.account.saves ?? 0} />
            ),
        },
        {
            id: "shares",
            header: sortableHeader("Shares"),
            size: 131,
            accessorFn: (row) => Number(row.account.shares ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell value={row.original.account.shares ?? 0} />
            ),
        },
    );

    return columns;
};