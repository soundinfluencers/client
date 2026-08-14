import { useId, useRef, type ReactNode, type RefObject } from "react";

import chevronDown from "@/assets/icons/chevron-down.svg";
import { useClickOutside } from "@/hooks/global/useClickOutside";
import { ButtonMain } from "@/shared/ui";

import { BundleAccountsCompactList } from "./bundle-accounts-compact-list";
import { BundleDetails } from "./bundle-details";
import { BundlePriceSummary } from "./bundle-price-summary";
import type {
    BundleCardDisplayModel,
} from "./bundle-card.types";

import styles from "./bundle-card.module.scss";

type Props = {
    bundle: BundleCardDisplayModel;
    isExpanded: boolean;
    isSelected: boolean;
    chooseDisabled: boolean;
    onToggleDetails: (bundleId: string) => void;
    onCloseDetails: () => void;
    onChoose: (bundleId: string) => void;
    onRemove: (bundleId: string) => void;
};

type DetailsPanelProps = {
    cardRef: RefObject<HTMLDivElement | null>;
    className: string;
    id: string;
    onClose: () => void;
    children: ReactNode;
};

const DetailsPanel = ({
    cardRef,
    className,
    id,
    onClose,
    children,
}: DetailsPanelProps) => {
    useClickOutside(cardRef, onClose);

    return (
        <div id={id} className={className}>
            {children}
        </div>
    );
};

export const BundleCard = ({
    bundle,
    isExpanded,
    isSelected,
    chooseDisabled,
    onToggleDetails,
    onCloseDetails,
    onChoose,
    onRemove,
}: Props) => {
    const detailsId = `bundle-details-${useId().replaceAll(":", "")}`;
    const cardRef = useRef<HTMLDivElement>(null);

    const handleChoose = () => {
        if (isSelected) {
            onRemove(bundle.bundleId);
        } else {
            onChoose(bundle.bundleId);
        }

        onCloseDetails();
    };

    return (
        <div ref={cardRef} className={styles.cardWrapper}>
            <article
                className={`${styles.card} ${
                    isSelected ? styles.selected : ""
                }`}
            >
                <header className={styles.header}>
                    <span className={styles.badge}>Bundle</span>
                    <span className={styles.followers}>
                        <span>Followers</span>
                        <strong>{bundle.followersLabel}</strong>
                    </span>
                </header>

                <div className={styles.summary}>
                    <BundleAccountsCompactList accounts={bundle.accounts} />
                    <BundlePriceSummary
                        priceLabel={bundle.priceLabel}
                        originalPriceLabel={bundle.originalPriceLabel}
                    />
                </div>

                <button
                    type="button"
                    className={styles.detailsToggle}
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => onToggleDetails(bundle.bundleId)}
                >
                    <span>See more details</span>
                    <img
                        className={isExpanded ? styles.chevronExpanded : ""}
                        src={chevronDown}
                        alt=""
                    />
                </button>

                {isExpanded && (
                    <DetailsPanel
                        cardRef={cardRef}
                        id={detailsId}
                        className={styles.detailsPanel}
                        onClose={onCloseDetails}
                    >
                        <BundleDetails accounts={bundle.accounts} />
                        <ButtonMain
                            className={styles.chooseButton}
                            text={isSelected ? "Remove" : "Choose"}
                            isDisabled={!isSelected && chooseDisabled}
                            onClick={handleChoose}
                        />
                    </DetailsPanel>
                )}
            </article>
        </div>
    );
};
