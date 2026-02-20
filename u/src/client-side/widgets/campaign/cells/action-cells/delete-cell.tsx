import React from "react";
import trash from "@/assets/icons/trash-2.svg";

import check from "@/assets/icons/check-circle (2).svg";
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

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(optionIndex, accountKey);
  };
  const onConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(optionIndex, accountKey);
    setIsConfirming(false);
  };
  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isRecentlyAdded) {
      removeAccount(optionIndex, accountKey);
      return;
    }

    setIsConfirming(true);
  };
  const onCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  };
  const onConfirmAdded = (e: React.MouseEvent) => {
    e.stopPropagation();

    clearRecentlyAdded(optionIndex, [String(accountKey)]);
  };

  return (
    <td className="tableBase__td trash-action">
      {" "}
      {isRecentlyAdded && (
        <div className="trash-action__content">
          <button
            type="button"
            onClick={onConfirmAdded}
            className="trash-action__confirm"
            aria-label="Confirm added"
            title="Confirm added">
            <img src={check} alt="" />
          </button>
        </div>
      )}
      {isRecentlyAdded && (
        <div className="trash-action__content">
          <button
            type="button"
            onClick={onDeleteClick}
            className="trash-action__delete">
            <img src={trash} alt="" />
          </button>
        </div>
      )}
      {!isRecentlyAdded && isConfirming && (
        <div className="trash-action__confirm-block">
          <span className="trash-action__label">Delete?</span>

          <div className="trash-action__confirm-block-row">
            <button
              type="button"
              onClick={onDelete}
              className="trash-action__same">
              <img src={checkConfirm} alt="" />
            </button>

            <button
              type="button"
              onClick={onCancelDelete}
              className="trash-action__same">
              <img src={x} alt="" />
            </button>
          </div>
        </div>
      )}
      {!isRecentlyAdded && !isConfirming && (
        <div className="trash-action__content">
          <button
            type="button"
            onClick={onDeleteClick}
            className="trash-action__delete">
            <img src={trash} alt="" />
          </button>
        </div>
      )}
    </td>
  );
};
