import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import plus from "@/assets/icons/plus.svg";
import styles from "./footer-summary.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {
    type BuildCampaignOffer,
    calcBuilderTotal
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total.ts";

export const FooterSummary = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedPromoCardIds = useCampaignBuilderStore((s) => s.selectedPromoCardIds);
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const setTotalPrice = useCampaignBuilderStore((s) => s.actions.setTotalPrice);
    const offersQueries = queryClient.getQueriesData({ queryKey: ["publishedOffers"] });

    const offers = offersQueries.flatMap(([, data]) =>
        Array.isArray(data) ? data : [],
    ) as BuildCampaignOffer[];


    const totalPrice = calcBuilderTotal({
        selectedOfferId,
        offers,
        selectedAccounts,
    });
    const canProceed = Boolean(selectedOfferId || selectedPromoCardIds.length >= 1);

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <p>
                    Offer: <span className={styles.count}>{selectedOfferId ? 1 : 0}</span>
                </p>
                <img src={plus} alt="" />
                <p>
                    Networks: <span className={styles.count}>{selectedPromoCardIds.length}</span>
                </p>
                <p>
                    Total: <span className={styles.count}>{totalPrice}€</span>
                </p>
            </div>

            <button
                className={canProceed ? styles.active : styles.disabled}
                disabled={!canProceed}
                onClick={() => {
                    if (!canProceed) return;

                    setTotalPrice(totalPrice);
                    navigate("/client/create-campaign/content");
                }}
            >
                Proceed
            </button>
        </div>
    );
};