import clsx from "clsx";
import draftIcon from "@/assets/bar-home/folder-plus (1).svg";
import proposalIcon from "@/assets/bar-home/edit-2.svg";
import underReviewIcon from "@/assets/bar-home/si_hourglass-duotone.svg";
import distributingIcon from "@/assets/bar-home/distribution icon.svg";
import completedIcon from "@/assets/bar-home/check-circle.svg";
import { useWindowSize } from "@/hooks/global/useWindowSize";
import styles from "./dashboard-toolbar.module.scss";
import type {CampaignFilterStatus} from "@/entities/client-side/dashboard/model/campaign.types.ts";
import type {CampaignViewMode} from "@/features/client-side/dashboard/switch-view/model/types.ts";
import {SwitchDashboardView} from "@/features/client-side/dashboard/switch-view/ui/switch-dashboard-view.tsx";

type Props = {
    status: CampaignFilterStatus;
    onStatusChange: (status: CampaignFilterStatus) => void;
    view: CampaignViewMode;
    onViewChange: (view: CampaignViewMode) => void;
};

const STATUS_OPTIONS: Array<{
    key: Exclude<CampaignFilterStatus, "all">;
    label: string;
    icon: string;
}> = [
    { key: "draft", label: "Drafts", icon: draftIcon },
    { key: "proposal", label: "Proposals", icon: proposalIcon },
    { key: "under_review", label: "Under Review", icon: underReviewIcon },
    { key: "distributing", label: "Distributing", icon: distributingIcon },
    { key: "closed", label: "Completed", icon: completedIcon },
];

export const DashboardToolbar = ({
                                     status,
                                     onStatusChange,
                                     view,
                                     onViewChange,
                                 }: Props) => {
    const { width } = useWindowSize();

    const handleStatusClick = (next: CampaignFilterStatus) => {
        onStatusChange(status === next ? "all" : next);
    };

    return (
        <section className={styles.root}>
            <div className={styles.titleRow}>
                <p>Campaigns</p>
                {width < 901 && <SwitchDashboardView value={view} onChange={onViewChange} />}
            </div>

            <div className={styles.content}>
                <div className={styles.filters}>
                    {STATUS_OPTIONS.map((item) => {
                        const isActive = status === "all" || status === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => handleStatusClick(item.key)}
                                className={clsx(styles.filterButton, isActive && styles.active)}
                            >
                                <img src={item.icon} alt="" />
                                <span>{item.label}</span>
                                <i className={clsx(styles.dot, !isActive && styles.dotHidden)} />
                            </button>
                        );
                    })}
                </div>

                {width > 901 && <SwitchDashboardView value={view} onChange={onViewChange} />}
            </div>
        </section>
    );
};