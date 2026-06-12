import React from "react";

import type {
    EditableCampaignAccount,
    EditableCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";
import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store";

import {
    buildCampaignTableRows,
    getCampaignAccountKey,
    getTotalFollowers,
    getTotalPrice,
} from "../model/campaign-table.helpers";

import { getCampaignTableColumns } from "../model/campaign-table.columns";
import { getCampaignInsightColumns } from "../model/campaign-insight.columns";

import type { StrategyGroup } from "../model/campaign-table.types";
import type {
    CampaignTableMode,
    CampaignView,
} from "@/features/client-side/campaign/campaign-view/model/campaign-view.types";

import { TableCampaign } from "@/widgets/client-side/campaign-tables/ui/strategy-table.tsx";

import styles from "./campaign-table-section.module.scss";

type Props = {
    mode: CampaignTableMode;
    view: CampaignView;
    isAdvancedInsights: boolean;

    title: string;
    group: StrategyGroup;
    accounts: EditableCampaignAccount[];
    items: EditableCampaignContentItem[];

    canEdit: boolean;
    canManageAccounts: boolean;

    optionIndex: number;
    currency?: string;
    totalPrice?: number
    isProposal: boolean;
};

export const CampaignTableSection = ({
                                         mode,
                                         view,
                                         isAdvancedInsights,
                                         title,
                                         group,
                                         accounts,
                                         items,
                                         canEdit,
                                         canManageAccounts,
                                         optionIndex,
                                         currency,
                                         totalPrice,
                                         isProposal
                                     }: Props) => {
    const setAccountSelectedContent = useCampaignStore(
        (s) => s.setAccountSelectedContent,
    );

    const setAccountDateRequest = useCampaignStore(
        (s) => s.setAccountDateRequest,
    );

    const setContentField = useCampaignStore((s) => s.setContentField);

    const setContentDescriptions = useCampaignStore(
        (s) => s.setContentDescriptions,
    );

    const addContentItem = useCampaignStore((s) => s.addContentItem);
    const removeContentItem = useCampaignStore((s) => s.removeContentItem);
    const removeAccount = useCampaignStore((s) => s.removeAccount);
    const setDeletingAccountKey = useCampaignStore((s) => s.setDeletingAccountKey);
    const clearRecentlyAdded = useCampaignStore((s) => s.clearRecentlyAdded);
    const deletingAccountKey = useCampaignStore((s) => s.deletingAccountKey);
    const recentlyAddedAccountKeys = useCampaignStore(
        (s) => s.recentlyAddedAccountKeys,
    );
    const rows = React.useMemo(
        () =>
            buildCampaignTableRows({
                accounts,
                items,
                group,
            }),
        [accounts, items, group],
    );
    const columns = React.useMemo(() => {
        if (mode === "insight") {
            return getCampaignInsightColumns({ group });
        }

        return getCampaignTableColumns({
            group,
            canEdit,
            canManageAccounts,
            isAdvancedInsights,
            setAccountSelectedContent,
            setAccountDateRequest,
            setContentField,
            setContentDescriptions,
            addContentItem,
            removeContentItem,
            removeAccount,
            setDeletingAccountKey,
            clearRecentlyAdded,
            deletingAccountKey,
            recentlyAddedAccountKeys,
            isProposal
        });
    }, [
        mode,
        group,
        canEdit,
        canManageAccounts,
        isAdvancedInsights,
        setAccountSelectedContent,
        setAccountDateRequest,
        setContentField,
        setContentDescriptions,
        addContentItem,
        removeContentItem,
        removeAccount,
        setDeletingAccountKey,
        clearRecentlyAdded,
        deletingAccountKey,
        recentlyAddedAccountKeys,
        isProposal
    ]);

    if (!rows.length) return null;

    return (
        <section className={styles.section}>
            <h3>{title}</h3>

            <TableCampaign
                data={rows}
                columns={columns}
                canEdit={canEdit}
                canManageAccounts={canManageAccounts}
                optionIndex={optionIndex}
                group={group}
                currency={currency}
                totalPrice={totalPrice}
                totalFollowers={getTotalFollowers(accounts)}
                footerMode={mode === "insight" ? "insight" : "strategy"}
                getRowKey={(row) => getCampaignAccountKey(row.account)}
            />
        </section>
    );
};