import React from "react";
import edit from "@/assets/icons/edit.svg";
import liveview from "@/assets/icons/Vector (15).svg";
import proview from "@/assets/icons/Vector (16).svg";
import styles from "./view-change.module.scss";
import type { StrategyViewMode } from "@/features/client-side/campaign-tables/model/use-campaign-strategy-view-params";

type Props = {
    view: StrategyViewMode;
    setView: (value: StrategyViewMode) => void;
    isProposal?: boolean;
};

export const ViewChange: React.FC<Props> = ({
                                                view,
                                                setView,
                                                isProposal = false,
                                            }) => {
    const tabs = isProposal
        ? [
            { label: "Edit View", icon: edit, value: -1 as StrategyViewMode },
            { label: "Pro View", icon: proview, value: 1 as StrategyViewMode },
            { label: "Live View", icon: liveview, value: 0 as StrategyViewMode },
        ]
        : [
            { label: "Live View", icon: liveview, value: 0 as StrategyViewMode },
            { label: "Pro View", icon: proview, value: 1 as StrategyViewMode },
        ];

    return (
        <div className={styles.changeViewTable}>
            <div className={styles.segmented}>
                {tabs.map((tab) => (
                    <div
                        key={tab.label}
                        className={`${styles.item} ${
                            view === tab.value ? styles.active : ""
                        }`}
                        onClick={() => setView(tab.value)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setView(tab.value);
                            }
                        }}
                        title={tab.label}
                    >
                        <img src={tab.icon} alt={tab.label} />
                    </div>
                ))}
            </div>
        </div>
    );
};