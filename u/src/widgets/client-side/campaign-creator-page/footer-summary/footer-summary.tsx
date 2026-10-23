import plus from "@/assets/icons/plus.svg";
import styles from "./footer-summary.module.scss";

type Props = {
    isAddInfluencerMode: boolean;
    selectedCurrency: string;
    selectedOfferId: string | null;
    selectedPromoCardIds: string[];
    totalPrice: number;
    totalPriceReady?: boolean;
    canProceed: boolean;
    offerAvailable?: boolean | null;
    onProceed: () => void;
};

export const FooterSummary = ({
                                  isAddInfluencerMode,
                                  selectedCurrency,
                                  selectedOfferId,
                                  selectedPromoCardIds,
                                  totalPrice,
                                  totalPriceReady = true,
                                  canProceed,
                                  offerAvailable,
                                  onProceed,
                              }: Props) => {
    return (
        <div className={styles.root}>
            <div className={styles.content}>
                {!isAddInfluencerMode && (
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
                        {offerAvailable === false ? "Review unavailable offer" : !totalPriceReady ? "Prices unavailable for the selected currency" : `${totalPrice}${selectedCurrency}`}
                    </span>
                </p>
            </div>

            <button
                className={canProceed ? styles.active : styles.disabled}
                disabled={!canProceed}
                onClick={onProceed}
            >
                {isAddInfluencerMode ? "Add account" : "Proceed"}
            </button>
        </div>
    );
};
