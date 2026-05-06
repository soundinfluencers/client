import React from "react";
import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type {
    StrategyGroup,
    StrategyMode,
    StrategyRow,
    StrategyTableActions,
} from "../model/campaign-strategy.types";
import { buildStrategyRows } from "../model/campaign-strategy.helpers";
import { getCampaignStrategyColumns } from "./campaign-strategy.columns";
import { TableCampaign } from "./strategy-table";
import "./table-base.scss";

type Props = {
    title: string;
    group: StrategyGroup;
    mode: StrategyMode;
    accounts: SelectedCampaignAccount[];
    items: CampaignContentItem[];
    totalPrice: number;
    actions?: StrategyTableActions;
    insights?: boolean;
};
export const CampaignStrategySection: React.FC<Props> = ({
                                                             title,
                                                             group,
                                                             mode,
                                                             accounts,
                                                             items,
                                                             totalPrice,
                                                             actions,
                                                             insights = false,
                                                         }) => {
    const rows = React.useMemo<StrategyRow[]>(
        () =>
            buildStrategyRows({
                accounts,
                items,
                group,
            }),
        [accounts, items, group],
    );

    const columns = React.useMemo(
        () =>
            getCampaignStrategyColumns({
                group,
                mode,
                actions,
                insights,
            }),
        [group, mode, actions, insights],
    );

    const totalFollowers = React.useMemo(() => {
        return accounts.reduce((sum, account) => {
            return sum + Number(account.followers ?? 0);
        }, 0);
    }, [accounts]);

    return (
        <div className="tableBase">
            <h3>{title}</h3>

            <TableCampaign
                canEdit={mode === "edit"}
                data={rows}
                group={group}
                totalFollowers={totalFollowers}
                totalPrice={totalPrice}
                columns={columns}
                canManageAccounts={mode === "edit"}
                isFetching={false}
                emptyText="No influencers found"
                optionIndex={0}
                highlightedRowKeys={mode === "edit" ? actions?.recentlyAddedAccountKeys ?? [] : []}
                deletingRowKey={mode === "edit" ? actions?.deletingAccountKey ?? null : null}
                getRowKey={(row) => row.accountKey}
            />
        </div>
    );
};