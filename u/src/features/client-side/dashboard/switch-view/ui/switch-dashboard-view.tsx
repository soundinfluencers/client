import clsx from "clsx";
// import menuIcon from "@/assets/icons/menu.svg";
// import gridIcon from "@/assets/icons/grid.svg";

import gridIcon from '@/assets/icons/Vector (16).svg';
import menuIcon from '@/assets/icons/Vector (15).svg';
import type { CampaignViewMode } from "../model/types";
import styles from "./switch-dashboard-view.module.scss";

type Props = {
    value: CampaignViewMode;
    onChange: (value: CampaignViewMode) => void;
    className?: string;
};

const ITEMS: Array<{ value: CampaignViewMode; icon: string; }> = [
    { value: "table", icon: menuIcon },
    { value: "grid", icon: gridIcon},
];

export const SwitchDashboardView = ({ value, onChange, className }: Props) => {
    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.content} role="tablist" aria-label="Campaign view switcher">
                {ITEMS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={value === item.value}
                        className={clsx(styles.item, value === item.value && styles.active)}
                        onClick={() => onChange(item.value)}
                    >
                        <img src={item.icon} alt="" aria-hidden="true" />
                    </button>
                ))}
            </div>
        </div>
    );
};