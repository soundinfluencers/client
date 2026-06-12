import React from "react";

import trash from "@/assets/icons/trash-2.svg";
import checkConfirm from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";

import type { CampaignTableRow } from "@/widgets/client-side/campaign/campaign-table/model/campaign-table.types.ts";

import styles from "./cells.module.scss";

type Props = {
    row: CampaignTableRow;
    canEdit: boolean;
    removeAccount?: (accountId: string) => void;
    setDeletingAccountKey?: (value: string | null) => void;
    clearRecentlyAdded?: (accountId: string) => void;
    deletingAccountKey?: string | null;
    recentlyAddedAccountKeys?: string[];
};

export const ActionTableCell: React.FC<Props> = ({
                                                     row,
                                                     canEdit,
                                                     removeAccount,
                                                     setDeletingAccountKey,
                                                     clearRecentlyAdded,
                                                     deletingAccountKey,
                                                     recentlyAddedAccountKeys = [],
                                                 }) => {
    const [confirming, setConfirming] = React.useState(false);

    const accountKey = row.accountKey;

    const isDeleting = deletingAccountKey === accountKey;
    const isRecentlyAdded = recentlyAddedAccountKeys.includes(accountKey);
    const isConfirming = confirming || isDeleting;

    const handleDelete = () => {
        setDeletingAccountKey?.(accountKey);
        removeAccount?.(accountKey);
        setConfirming(false);
    };

    const handleCancel = () => {
        setConfirming(false);
        setDeletingAccountKey?.(null);
    };

    if (!canEdit) {
        return <p className={styles.empty}>—</p>;
    }

    if (isRecentlyAdded) {
        return (
            <div className={styles.actionButtons}>
                <button
                    type="button"
                    onClick={() => clearRecentlyAdded?.(accountKey)}
                    className={styles.actionIconButton}
                    title="Confirm"
                >
                    <img src={checkConfirm} alt="" />
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className={styles.actionIconButton}
                    title="Delete"
                >
                    <img src={trash} alt="" />
                </button>
            </div>
        );
    }

    if (isConfirming) {
        return (
            <div className={styles.actionConfirm}>
                <span className={styles.confirmText}>Delete?</span>

                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className={styles.actionIconButton}
                        title="Yes"
                    >
                        <img src={checkConfirm} alt="" />
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className={styles.actionIconButton}
                        title="No"
                    >
                        <img src={x} alt="" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.actionCell}>
            <button
                type="button"
                onClick={() => {
                    setDeletingAccountKey?.(accountKey);
                    setConfirming(true);
                }}
                className={styles.trashButton}
                title="Delete"
            >
                <img src={trash} alt="" />
            </button>
        </div>
    );
};