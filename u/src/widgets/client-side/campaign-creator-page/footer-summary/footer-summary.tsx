import plus from "@/assets/icons/plus.svg";
import styles from "./footer-summary.module.scss";

type Props = {
    isAddInfluencerMode: boolean;
    isAiAddPagesMode?: boolean;
    isSaving?: boolean;
    selectedCurrency: string;
    selectedOfferId: string | null;
    selectedPromoCardIds: string[];
    totalPrice: number;
    canProceed: boolean;
    onProceed: () => void;
};

export const FooterSummary = ({
                                  isAddInfluencerMode,
                                  isAiAddPagesMode = false,
                                  isSaving = false,
                                  selectedCurrency,
                                  selectedOfferId,
                                  selectedPromoCardIds,
                                  totalPrice,
                                  canProceed,
                                  onProceed,
                              }: Props) => {
    return (
        <div className={styles.root}>
            <div className={styles.content}>
                {!isAddInfluencerMode && !isAiAddPagesMode && (
                    <>
                        <p>
                            Offer:{" "}
                            <span className={styles.count}>
                                {selectedOfferId ? 1 : 0}
                            </span>
                        </p>
                        <img src={plus} alt="" />
                    </>
                )}

                <p>
                    Networks:{" "}
                    <span className={styles.count}>
                        {selectedPromoCardIds.length}
                    </span>
                </p>

                <p>
                    Total:{" "}
                    <span className={styles.count}>
                        {totalPrice}
                        {selectedCurrency}
                    </span>
                </p>
            </div>

            <button
                className={canProceed && !isSaving ? styles.active : styles.disabled}
                disabled={!canProceed || isSaving}
                onClick={onProceed}
            >
                {isAddInfluencerMode
                    ? "Add account"
                    : isAiAddPagesMode
                        ? (isSaving ? "Saving..." : "Save pages & return")
                        : "Proceed"}
            </button>
        </div>
    );
};
