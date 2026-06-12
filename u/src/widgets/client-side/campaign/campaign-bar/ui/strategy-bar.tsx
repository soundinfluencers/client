import type { EditableCampaign } from "@/entities/client-side/campaign/store/campaign.store";
import {
    formatCampaignDate,
    formatFollowers,
    getCampaignBudget,
    getCampaignReach,
    getCurrencySymbol,
} from "../model/campaign-bar.helpers";
import styles from "./campaign-bar.module.scss";

type Props = {
    campaign: EditableCampaign | null;
};

export const StrategyBar = ({ campaign }: Props) => {
    const budget = getCampaignBudget(campaign);
    const currency = getCurrencySymbol(campaign?.displayCurrency);

    const reach = getCampaignReach(campaign);
    const posts = Number(campaign?.addedAccounts?.length ?? 0);
    const videos = Number(campaign?.campaignContent?.length ?? 0);

    return (
        <div className={styles.strategyBar}>
            <div className={styles.metric}>
                <p>
                    Status: <strong>{campaign?.status || "—"}</strong>
                </p>
                <div className={styles.divider} />
            </div>

            <div className={styles.metric}>
                <p>
                    Submitted:{" "}
                    <strong>{formatCampaignDate(campaign?.creationDate)}</strong>
                </p>
                <div className={styles.divider} />
            </div>

            <div className={styles.metric}>
                <p>
                    Budget:{" "}
                    <strong>
                        {budget > 0 ? budget : "—"} {currency}
                    </strong>
                </p>
                <div className={styles.divider} />
            </div>

            <div className={styles.metric}>
                <p>
                    Reach: <strong>{formatFollowers(reach)} followers</strong>
                </p>
                <div className={styles.divider} />
            </div>

            <div className={styles.metric}>
                <p>
                    Posts: <strong>{posts}</strong>
                </p>
                <div className={styles.divider} />
            </div>

            <div className={styles.metric}>
                <p>
                    Videos: <strong>{videos}</strong>
                </p>
            </div>
        </div>
    );
};