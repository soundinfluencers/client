import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";

type Props = {
    row: StrategyRow;
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

    const isDeleting = deletingAccountKey === row.accountKey;
    const isRecentlyAdded = recentlyAddedAccountKeys.includes(row.accountKey);

    if (!canEdit) {
        return <p>—</p>;
    }

    if (isRecentlyAdded) {
        return (
            <div className="trash-action">
                <button
                    type="button"
                    onClick={() => clearRecentlyAdded?.(row.accountKey)}
                >
                    OK
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setDeletingAccountKey?.(row.accountKey);
                        removeAccount?.(row.accountKey);
                    }}
                >
                    Delete
                </button>
            </div>
        );
    }

    if (confirming || isDeleting) {
        return (
            <div className="trash-action">
                <span>Delete?</span>
                <button
                    type="button"
                    onClick={() => {
                        setDeletingAccountKey?.(row.accountKey);
                        removeAccount?.(row.accountKey);
                        setConfirming(false);
                    }}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setConfirming(false);
                        setDeletingAccountKey?.(null);
                    }}
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <div className="trash-action">
            <button
                type="button"
                onClick={() => {
                    setDeletingAccountKey?.(row.accountKey);
                    setConfirming(true);
                }}
            >
                Delete
            </button>
        </div>
    );
};