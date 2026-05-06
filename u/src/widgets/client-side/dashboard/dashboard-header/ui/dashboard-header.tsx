import { useNavigate } from "react-router-dom";
import arrowIcon from "@/assets/icons/arrow-down-right.svg";
import logoIcon from "@/assets/logos/small-black-logo.svg";
import { useWindowSize } from "@/hooks/global/useWindowSize";
import styles from "./dashboard-header.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

type Props = {
    firstName?: string;
    balance?: number;
};

export const DashboardHeader = ({ firstName, balance }: Props) => {
    const { width } = useWindowSize();
    const navigate = useNavigate();

    const resetCampaign = useCampaignBuilderStore((s) => s.actions.reset);


    const onNavigateToCampaign = () => {
        resetCampaign();
        navigate("/client/create-campaign");
    };

    if (width <= 812) {
        return (
            <section className={styles.mobile}>
                <div className={styles.mobileCard}>
                    <div className={styles.mobileGreeting}>
                        {firstName ? `Welcome back, ${firstName}!` : "Welcome back!"}
                    </div>

                    <div className={styles.balanceBlock}>
                        <div className={styles.balanceTitle}>
                            <img src={logoIcon} alt="" />
                            <span>Balance</span>
                        </div>
                        <div className={styles.balanceValue}>{balance ?? 0}€</div>
                    </div>
                </div>

                <div className={styles.mobileActions}>
                    <button type="button" className={styles.actionCard} onClick={onNavigateToCampaign}>
                        <span>Create a campaign</span>
                        <span className={styles.actionIcon}>
              <img src={arrowIcon} alt="" />
            </span>
                    </button>

                    <button
                        type="button"
                        className={styles.actionCard}
                        onClick={() => navigate("/client/agency-campaign")}
                    >
                        <span>Agency Campaign</span>
                        <span className={styles.actionIcon}>
              <img src={arrowIcon} alt="" />
            </span>
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.root}>
            <div className={styles.left}>
                <div className={styles.greeting}>
                    <p>{firstName ? `Welcome back, ${firstName}!` : "Welcome back!"}</p>
                </div>

                <p className={styles.subtitle}>Launch a new campaign</p>

                <div className={styles.actionsRow}>
                    <button type="button" className={styles.actionCard} onClick={onNavigateToCampaign}>
                        <span>Create a campaign</span>
                        <span className={styles.actionIcon}>
              <img src={arrowIcon} alt="" />
            </span>
                        <div className={styles.tooltip}>
                            Build and launch your campaign directly on the platform. Full control, instant setup.
                        </div>
                    </button>

                    <button
                        type="button"
                        className={styles.actionCard}
                        onClick={() => navigate("/client/agency-campaign")}
                    >
                        <span>Agency Campaign</span>
                        <span className={styles.actionIcon}>
              <img src={arrowIcon} alt="" />
            </span>
                        <div className={styles.tooltip}>
                            Our team designs, manages, and optimizes the campaign for you.
                        </div>
                    </button>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.rightTop} />
                <div className={styles.rightBottom}>
                    <div className={styles.balanceBlock}>
                        <div className={styles.balanceTitle}>
                            <img src={logoIcon} alt="" />
                            <span>Balance</span>
                        </div>
                        <div className={styles.balanceValue}>{balance ?? 0}€</div>
                    </div>
                </div>
            </div>
        </section>
    );
};