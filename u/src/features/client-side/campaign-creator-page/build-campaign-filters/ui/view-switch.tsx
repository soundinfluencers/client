import gridIcon from '@/assets/icons/Vector (16).svg';
import menuIcon from '@/assets/icons/Vector (15).svg';
import styles from "./view-switch.module.scss";
import type {
    CampaignCardsViewMode
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

type Props = {
    view: CampaignCardsViewMode;
    setView: (view: CampaignCardsViewMode) => void;
    className?: string;
};

const VIEW_ITEMS: Array<{ key: CampaignCardsViewMode; icon: string }> = [
    { key: "table", icon: menuIcon },
    { key: "grid", icon: gridIcon },
];

export const ViewSwitch = ({ view, setView, className }: Props) => {
    return (
        <div className={`${styles.root} ${className ?? ""}`}>
            <div className={styles.content}>
                {VIEW_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`${styles.item} ${view === item.key ? styles.active : ""}`}
                        onClick={() => setView(item.key)}
                    >
                        <img src={item.icon} alt="" />
                    </button>
                ))}
            </div>
        </div>
    );
};