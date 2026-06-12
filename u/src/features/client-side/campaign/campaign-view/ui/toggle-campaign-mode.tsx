import React from "react";

import repeat from "@/assets/bar-campaign-strategy/repeat.svg";

import styles from "./toggle-campaign-mode.module.scss";
import type {CampaignTableMode} from "@/features/client-side/campaign/campaign-view/model/campaign-view.types.ts";

type Props = {
    mode: CampaignTableMode;
    onChange: () => void;
};

export const ToggleCampaignMode: React.FC<Props> = ({ mode, onChange }) => {
    const isInsight = mode === "insight";

    return (
        <div className={styles.toggleTables}>
            <button
                type="button"
                onClick={onChange}
                className={`${styles.toggleTables__btn} ${
                    !isInsight ? styles.active : ""
                }`}
            >
                <img src={repeat} alt="" />
                <p>{isInsight ? "Campaign Insights" : "Campaign Strategy"}</p>
            </button>
        </div>
    );
};