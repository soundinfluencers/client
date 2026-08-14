import bundleIcon from "@/assets/icons/bundle-layers.svg";

import styles from "./campaign-catalog-mode-toggle.module.scss";

export type CampaignCatalogMode = "networks" | "bundles";

type Props = {
    mode: CampaignCatalogMode;
    onModeChange: (mode: CampaignCatalogMode) => void;
};

export const CampaignCatalogModeToggle = ({
    mode,
    onModeChange,
}: Props) => {
    const isBundleMode = mode === "bundles";

    return (
        <button
            type="button"
            className={`${styles.root} ${isBundleMode ? styles.active : ""}`}
            aria-label="Bundles"
            aria-pressed={isBundleMode}
            onClick={() => onModeChange(isBundleMode ? "networks" : "bundles")}
        >
            <img src={bundleIcon} alt="" />
            <span>Bundle</span>
        </button>
    );
};
