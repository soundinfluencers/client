import clsx from "clsx";

import styles from "./agency-campaign-tab-bar.module.scss";
import {AGENCY_CAMPAIGN_TABS} from "@/entities/client-side/agency-campaign/model/agency-campaign.constants.ts";
import type {AgencyCampaignTabId} from "@/entities/client-side/agency-campaign/model/agency-campaign.types.ts";

type Props = {
    activeTab: AgencyCampaignTabId;
    onChange: (tab: AgencyCampaignTabId) => void;
};

export const AgencyCampaignTabBar = ({ activeTab, onChange }: Props) => {
    return (
        <div className={styles.root}>
            <p className={styles.label}>Promo type</p>

            <ul className={styles.list}>
                {AGENCY_CAMPAIGN_TABS.map((tab) => (
                    <li key={tab.id}>
                        <button
                            type="button"
                            className={clsx(styles.tab, activeTab === tab.id && styles.active)}
                            onClick={() => onChange(tab.id)}
                        >
                            <img src={tab.icon} alt="" />
                            <span>{tab.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};