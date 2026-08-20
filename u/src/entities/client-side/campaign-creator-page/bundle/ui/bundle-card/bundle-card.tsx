import {
    useId,
    useRef,
    type MouseEvent,
    type ReactNode,
    type RefObject,
} from "react";

import chevronDown from "@/assets/icons/chevron-down.svg";
import { useClickOutside } from "@/hooks/global/useClickOutside";
import { ButtonMain } from "@/shared/ui";

import { BundleAccountsCompactList } from "./bundle-accounts-compact-list";
import { BundleDetails } from "./bundle-details";
import { BundlePriceSummary } from "./bundle-price-summary";
import {
    canToggleBundleFromCard,
    isBundleCardSurfaceClick,
} from "./bundle-card.interactions";
import type {
    BundleCardDisplayModel,
} from "./bundle-card.types";

import styles from "./bundle-card.module.scss";

type Props = {
    bundle: BundleCardDisplayModel;
    isExpanded: boolean;
    isSelected: boolean;
    isIncludedInSelectedOffer: boolean;
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
    isIncludedInSelectedOffer,
    chooseDisabled,
    onToggleDetails,
    onCloseDetails,
    onChoose,
    onRemove,
}: Props) => {
    const detailsId = `bundle-details-${useId().replaceAll(":", "")}`;
    const cardRef = useRef<HTMLDivElement>(null);
    const canToggleSelection = canToggleBundleFromCard({
        isSelected,
        chooseDisabled,
        isIncludedInSelectedOffer,
    });

    const handleChoose = () => {
        if (!canToggleSelection) return;

        if (isSelected) {
            onRemove(bundle.bundleId);
        } else {
            onChoose(bundle.bundleId);
        }

        onCloseDetails();
    };

    const handleCardClick = (event: MouseEvent<HTMLElement>) => {
        if (!isBundleCardSurfaceClick(event.target)) return;

        handleChoose();
    };

    return (
        <div ref={cardRef} className={styles.cardWrapper}>
            <article
                className={`${styles.card} ${
                    isSelected ? styles.selected : ""
                } ${
                    isIncludedInSelectedOffer ? styles.included : ""
                } ${
                    canToggleSelection ? styles.cardInteractive : ""
                }`}
                onClick={handleCardClick}
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

                {isIncludedInSelectedOffer && (
                    <div className={styles.includedText}>
                        Included in your selected offer
                    </div>
                )}

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
                            isDisabled={!canToggleSelection}
                            onClick={handleChoose}
                        />
                    </DetailsPanel>
                )}
            </article>
        </div>
    );
};
