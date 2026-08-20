import React from "react";
import { toast } from "react-toastify";
import trash from "@/assets/icons/trash-2.svg";

import checkConfirm from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";

import { useProposalAccountsStore } from "@/client-side/store";
import { getAccountKey } from "@/client-side/utils";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";
import {
  decideProposalOverlapRemoval,
  type ProposalOverlapRemovalDecision,
} from "@/client-side/widgets/campaign/model/proposal-overlap-removal";
import {
  decideProposalRowRemoval,
  executeProposalRowRemovalDecision,
} from "@/client-side/widgets/campaign/model/proposal-row-removal";

type ExecutableOverlapRemovalDecision = Extract<
  ProposalOverlapRemovalDecision,
  { kind: "remove_packages" | "delete_option" }
>;

type Props = {
  data: any;
  optionIndex: number;
  optionIndexes: number[];
  onDeleteOption?: (optionIndex: number) => Promise<void>;
  isMutationPending: boolean;
};

export const ActionCell: React.FC<Props> = ({
  data,
  optionIndex,
  optionIndexes,
  onDeleteOption,
  isMutationPending,
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [overlapDecision, setOverlapDecision] =
    React.useState<ExecutableOverlapRemovalDecision | null>(null);
  const [isDestructiveActionPending, setIsDestructiveActionPending] =
    React.useState(false);
  const destructiveActionPendingRef = React.useRef(false);
  const accountKey = getAccountKey(data);

  const removeAccount = useProposalAccountsStore((s) => s.removeAccount);
  const removeOfferBundleOverlap = useProposalAccountsStore(
    (s) => s.removeOfferBundleOverlap,
  );
  const clearRecentlyAdded = useProposalAccountsStore(
      (s) => s.clearRecentlyAdded,
  );

  const accounts = useProposalAccountsStore(
      (s) => s.accountsByOption?.[optionIndex] ?? [],
  );

  const isRecentlyAdded = useProposalAccountsStore(
      (s) => !!s.recentlyAddedKeysByOption?.[optionIndex]?.[String(accountKey)],
  );

  const markPendingDelete = useProposalAccountsStore((s) => s.markPendingDelete);
  const clearPendingDelete = useProposalAccountsStore((s) => s.clearPendingDelete);

  const snapshot = useProposalAccountsStore(
      (s) => s.optionSnapshotsByIndex?.[optionIndex],
  );
  const pendingOffer = useProposalAccountsStore((state) =>
    Object.prototype.hasOwnProperty.call(
      state.selectedOfferChangeByOption,
      optionIndex,
    )
      ? state.selectedOfferChangeByOption[optionIndex]
      : undefined,
  );
  const effectiveOffer =
    pendingOffer === undefined ? snapshot?.selectedOffer ?? null : pendingOffer;
  const fullOverlapDecision = React.useMemo(
    () =>
      decideProposalOverlapRemoval({
        targetAccount: data,
        accounts,
        selectedOffer: effectiveOffer,
        optionIndexes,
      }),
    [data, accounts, effectiveOffer, optionIndexes],
  );
  const rowRemovalDecision = React.useMemo(
    () =>
      decideProposalRowRemoval({
        targetAccount: data,
        accounts,
        selectedOffer: effectiveOffer,
        optionIndexes,
      }),
    [data, accounts, effectiveOffer, optionIndexes],
  );
  const deleteLabel = rowRemovalDecision.kind === "not_removable"
    ? "Delete?"
    : rowRemovalDecision.removalKind === "bundle"
      ? "Remove Bundle?"
      : rowRemovalDecision.removalKind === "offer"
        ? "Remove Offer?"
        : "Delete?";

  React.useEffect(() => {
    if (!isRecentlyAdded) return;

    clearRecentlyAdded(optionIndex, [String(accountKey)]);
  }, [isRecentlyAdded, optionIndex, accountKey, clearRecentlyAdded]);

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      rowRemovalDecision.kind === "not_removable" ||
      destructiveActionPendingRef.current ||
      isMutationPending
    ) {
      return;
    }

    if (rowRemovalDecision.kind === "delete_option" && !onDeleteOption) {
      toast.error("This Proposal option cannot be deleted from this view.");
      return;
    }

    destructiveActionPendingRef.current = true;
    setIsDestructiveActionPending(true);

    try {
      await executeProposalRowRemovalDecision(rowRemovalDecision, {
        onKeepOption: () => {
          clearPendingDelete(optionIndex, String(accountKey));
          removeAccount(optionIndex, accountKey);
        },
        onDeleteOption: async () => {
          await onDeleteOption?.(optionIndex);
        },
        onBlockLastOption: () => {
          toast.error("You cannot delete the last option");
        },
      });
      setIsConfirming(false);
    } finally {
      clearPendingDelete(optionIndex, String(accountKey));
      destructiveActionPendingRef.current = false;
      setIsDestructiveActionPending(false);
    }
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isMutationPending || destructiveActionPendingRef.current) return;

    if (fullOverlapDecision.kind === "block_last_option") {
      toast.error(
        "This action would remove the last Proposal option. Deleting the entire Proposal campaign is not supported yet.",
      );
      return;
    }

    if (
      fullOverlapDecision.kind === "remove_packages" ||
      fullOverlapDecision.kind === "delete_option"
    ) {
      setOverlapDecision(fullOverlapDecision);
      return;
    }

    if (rowRemovalDecision.kind === "block_last_option") {
      toast.error("You cannot delete the last option");
      return;
    }

    if (rowRemovalDecision.kind === "not_removable") return;

    markPendingDelete(optionIndex, String(accountKey));
    setIsConfirming(true);
  };

  const onCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    clearPendingDelete(optionIndex, String(accountKey));
    setIsConfirming(false);
  };

  const onCancelOverlapRemoval = () => {
    if (isDestructiveActionPending || isMutationPending) return;
    setOverlapDecision(null);
  };

  const onConfirmOverlapRemoval = async () => {
    if (
      !overlapDecision ||
      destructiveActionPendingRef.current ||
      isMutationPending
    ) {
      return;
    }

    destructiveActionPendingRef.current = true;
    setIsDestructiveActionPending(true);

    try {
      if (overlapDecision.kind === "remove_packages") {
        removeOfferBundleOverlap(optionIndex, overlapDecision.overlap);
      } else {
        if (!onDeleteOption) {
          toast.error("This Proposal option cannot be deleted from this view.");
          return;
        }
        await onDeleteOption(optionIndex);
      }

      setOverlapDecision(null);
    } finally {
      destructiveActionPendingRef.current = false;
      setIsDestructiveActionPending(false);
    }
  };

  const isFullOverlap = fullOverlapDecision.kind !== "not_full_overlap";
  const isDeleteDisabled =
    isMutationPending ||
    isDestructiveActionPending ||
    (!isFullOverlap && rowRemovalDecision.kind === "not_removable");

  return (
    <>
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
                  disabled={isDeleteDisabled}
                  title={
                    fullOverlapDecision.kind === "block_last_option"
                      ? "Removing the last Proposal option is not supported yet"
                      : rowRemovalDecision.kind === "block_last_option"
                        ? "You cannot delete the last option"
                        : rowRemovalDecision.kind !== "not_removable" || isFullOverlap
                          ? "Delete account"
                          : "You cannot delete the last Proposal account"
                  }
              >
                <img src={trash} alt="" />
              </button>
            </div>
        )}

        {isConfirming && (
            <div className="trash-action__confirm-block">
              <span className="trash-action__label">{deleteLabel}</span>

              <div className="trash-action__confirm-block-row">
                <button
                    type="button"
                    onClick={onDelete}
                    className="trash-action__same"
                    disabled={
                      isMutationPending || isDestructiveActionPending
                    }
                >
                  <img src={checkConfirm} alt="" />
                </button>

                <button
                    type="button"
                    onClick={onCancelDelete}
                    className="trash-action__same"
                    disabled={
                      isMutationPending || isDestructiveActionPending
                    }
                >
                  <img src={x} alt="" />
                </button>
              </div>
            </div>
        )}
      </td>

      {overlapDecision && (
        <Modal
          isShowCloseButton={false}
          isCloseOnClickOutsideDisabled={
            isDestructiveActionPending || isMutationPending
          }
          onClose={onCancelOverlapRemoval}
        >
          <div className="create-option">
            <h2>Are you sure?</h2>
            <p>
              {overlapDecision.kind === "delete_option"
                ? "Removing this account will remove both the Offer and the Bundle. Since no other accounts will remain, this Proposal option will also be deleted."
                : "Removing this account will remove both the Offer and the Bundle from this Proposal option."}
            </p>

            <div className="create-option-btn">
              <ButtonSecondary
                className="btn"
                text="Cancel"
                onClick={onCancelOverlapRemoval}
                isDisabled={isDestructiveActionPending || isMutationPending}
              />
              <ButtonMain
                className="btn"
                text={
                  isDestructiveActionPending || isMutationPending
                    ? "Deleting..."
                    : "Delete"
                }
                onClick={onConfirmOverlapRemoval}
                isDisabled={isDestructiveActionPending || isMutationPending}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
