import React from "react";
import trash from "@/assets/icons/trash-2.svg";

import checkConfirm from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";

import { useProposalAccountsStore } from "@/client-side/store";
import { getAccountKey } from "@/client-side/utils";

export const ActionCell: React.FC<{ data: any; optionIndex: number }> = ({
                                                                           data,
                                                                           optionIndex,
                                                                         }) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const accountKey = getAccountKey(data);

  const removeAccount = useProposalAccountsStore((s) => s.removeAccount);
  const clearRecentlyAdded = useProposalAccountsStore(
      (s) => s.clearRecentlyAdded,
  );
  const isRecentlyAdded = useProposalAccountsStore(
      (s) => !!s.recentlyAddedKeysByOption?.[optionIndex]?.[String(accountKey)],
  );

  const markPendingDelete = useProposalAccountsStore((s) => s.markPendingDelete);
  const clearPendingDelete = useProposalAccountsStore((s) => s.clearPendingDelete);

  React.useEffect(() => {
    if (!isRecentlyAdded) return;

    clearRecentlyAdded(optionIndex, [String(accountKey)]);
  }, [isRecentlyAdded, optionIndex, accountKey, clearRecentlyAdded]);

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearPendingDelete(optionIndex, String(accountKey));
    removeAccount(optionIndex, accountKey);
    setIsConfirming(false);
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    markPendingDelete(optionIndex, String(accountKey));
    setIsConfirming(true);
  };

  const onCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearPendingDelete(optionIndex, String(accountKey));
    setIsConfirming(false);
  };

  return (
      <td
          className={`tableBase__td trash-action ${
              isConfirming ? "td-wide" : ""
          }`}
      >
        {!isConfirming && (
            <div className="trash-action__content">
              <button
                  type="button"
                  onClick={onDeleteClick}
                  className="trash-action__delete"
              >
                <img src={trash} alt="" />
              </button>
            </div>
        )}

        {isConfirming && (
            <div className="trash-action__confirm-block">
              <span className="trash-action__label">Delete?</span>

              <div className="trash-action__confirm-block-row">
                <button
                    type="button"
                    onClick={onDelete}
                    className="trash-action__same"
                >
                  <img src={checkConfirm} alt="" />
                </button>

                <button
                    type="button"
                    onClick={onCancelDelete}
                    className="trash-action__same"
                >
                  <img src={x} alt="" />
                </button>
              </div>
            </div>
        )}

        {/*
        Убрали special UI для isRecentlyAdded:
        {isRecentlyAdded && (
          <div className="isRecentlyAdded">...</div>
        )}
      */}
      </td>
  );
};