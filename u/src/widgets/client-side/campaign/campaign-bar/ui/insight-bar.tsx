import type { EditableCampaign } from "@/entities/client-side/campaign/store/campaign.store";
import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store";
import { EyeHide } from "./eye-hide";
import {
    formatCampaignDate,
    formatFollowers,
    getCampaignBudget,
    getCurrencySymbol,
    getResultCPM,
} from "../model/campaign-bar.helpers";

import edit from "@/assets/icons/edit-3.png";
import insight from "@/assets/icons/bar-chart-2.svg";
import activity from "@/assets/icons/activity.svg";

import styles from "./campaign-bar.module.scss";

type Props = {
    campaign: EditableCampaign | null;
};

export const InsightBar = ({ campaign }: Props) => {
    const setIsPriceHidden = useCampaignStore((s) => s.setIsPriceHidden);
    const setIsCpmAndResultHidden = useCampaignStore(
        (s) => s.setIsCpmAndResultHidden,
    );

    const budget = getCampaignBudget(campaign);
    const currency = getCurrencySymbol(campaign?.displayCurrency);

    const posts = Number(campaign?.addedAccounts?.length ?? 0);
    const videos = Number(campaign?.campaignContent?.length ?? 0);
    const reach = Number(campaign?.totalFollowers ?? 0);

    const impressions = Number(campaign?.totalImpressions ?? 0);
    const likes = Number(campaign?.totalLikes ?? 0);
    const comments = Number(campaign?.totalComments ?? 0);
    const saves = Number(campaign?.totalSaves ?? 0);
    const shares = Number(campaign?.totalShares ?? 0);

    const isPriceHidden = Boolean(campaign?.isPriceHidden);
    const isCpmHidden = Boolean(campaign?.isCpmAndResultHidden);

    const cpm = Number(campaign?.cpm ?? 0);
    const resultCPM = getResultCPM(cpm);

    const hiddenValue = "••••";

    return (
        <div className={styles.insightBar}>
            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <img src={edit} alt="" />
                    <h3>Brief</h3>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.box}>
                        <p>
                            Submitted:{" "}
                            <strong>{formatCampaignDate(campaign?.creationDate)}</strong>
                        </p>

                        <p className={styles.hide}>
                            Budget:{" "}
                            <strong>
                                {isPriceHidden ? hiddenValue : `${budget} ${currency}`}
                            </strong>

                            <EyeHide
                                isHidden={isPriceHidden}
                                onToggle={() => setIsPriceHidden(!isPriceHidden)}
                            />
                        </p>

                        <p>
                            Posts: <strong>{posts}</strong>
                        </p>
                    </div>

                    <div className={styles.box}>
                        <p>
                            Reach: <strong>{formatFollowers(reach)} followers</strong>
                        </p>

                        <p>
                            Videos: <strong>{videos}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <img src={insight} alt="" />
                    <h3>Insight</h3>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.box}>
                        <p>
                            Impressions: <strong>{impressions}</strong>
                        </p>

                        <p>
                            Likes: <strong>{likes}</strong>
                        </p>

                        <p>
                            Saves: <strong>{saves}</strong>
                        </p>
                    </div>

                    <div className={styles.box}>
                        <p>
                            Comments: <strong>{comments}</strong>
                        </p>

                        <p>
                            Shares: <strong>{shares}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    <img src={activity} alt="" />
                    <h3>Performance</h3>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.box}>
                        <p className={styles.hide}>
                            CPM:{" "}
                            <strong>{isCpmHidden ? hiddenValue : `${cpm}€`}</strong>

                            <EyeHide
                                isHidden={isCpmHidden}
                                onToggle={() =>
                                    setIsCpmAndResultHidden(!isCpmHidden)
                                }
                            />
                        </p>

                        <p>
                            Average Instagram CPM: <strong>5€ to 12€</strong>
                        </p>

                        <p>
                            Result:{" "}
                            <strong>{isCpmHidden ? hiddenValue : resultCPM}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};