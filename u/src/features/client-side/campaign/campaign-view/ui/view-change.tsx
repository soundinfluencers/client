import React from "react";

import edit from "@/assets/icons/edit.svg";
import proview from "@/assets/icons/Vector (15).svg";
import liveview from "@/assets/icons/Vector (16).svg";

import type { CampaignView } from "../model/campaign-view.types";

import styles from "./view-change.module.scss";

type Props = {
    view: CampaignView;
    setView: (view: CampaignView) => void;
    isProposal?: boolean;
    canEdit?: boolean;
};

export const ViewChange: React.FC<Props> = ({
                                                setView,
                                                view,
                                                isProposal,
                                                canEdit,
                                            }) => {
    const tabs: Array<{
        value: CampaignView;
        label: string;
        icon: string;
    }> = isProposal
        ? [
            ...(canEdit
                ? [
                    {
                        value: -1 as CampaignView,
                        label: "Edit View",
                        icon: edit,
                    },
                ]
                : []),
            {
                value: 0,
                label: "Pro View",
                icon: proview,
            },
            {
                value: 1,
                label: "Live View",
                icon: liveview,
            },
        ]
        : [
            {
                value: 1,
                label: "Live View",
                icon: liveview,
            },
            {
                value: 0,
                label: "Pro View",
                icon: proview,
            },
        ];

    return (
        <div className={styles.changeViewTable}>
            <div className={styles.changeViewTable__segmented}>
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.label}
                        className={`${styles.changeViewTable__item} ${
                            view === tab.value ? styles.active : ""
                        }`}
                        onClick={() => setView(tab.value)}
                    >
                        <img src={tab.icon} alt="" />
                    </button>
                ))}
            </div>
        </div>
    );
};