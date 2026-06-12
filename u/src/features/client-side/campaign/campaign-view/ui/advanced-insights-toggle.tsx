import React from "react";

import repeat from "@/assets/icons/Vector (14).svg";
import styles from "./advanced-insights-toggle.module.scss";

type Props = {
    isActive: boolean;
    onChange: () => void;
};

export const AdvancedInsightsToggle: React.FC<Props> = ({
                                                            isActive,
                                                            onChange,
                                                        }) => {
    return (
        <div className={styles.viewAudience}>
            <button
                type="button"
                onClick={onChange}
                className={`${styles.viewAudience__btn} ${
                    isActive ? styles.active : ""
                }`}
            >
                <img src={repeat} alt="" />
                <p>Advanced Insights</p>
            </button>
        </div>
    );
};