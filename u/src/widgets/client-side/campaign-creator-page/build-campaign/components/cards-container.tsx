import React from "react";
import { TableCardSkeleton } from "@components/ui/skeletons/table-card-skeleton";
import { CardSkeleton } from "@components/ui/skeletons/card-skeleton";

import { TableRowCard } from "./table-row-card";
import { PromoCardGrid } from "./promo-card-grid";
import styles from "./cards-container.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import type {
    PromoAccount
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";
import type {
    CampaignCardsViewMode
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

interface Props {
    view: CampaignCardsViewMode;
    setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
    isSmall: boolean;
    promosCards: PromoAccount[];
    isInitialLoading: boolean;
    isFetchingMore: boolean;
    isRefetching: boolean;
}

export const CardsContainer: React.FC<Props> = ({
                                                    view,
                                                    setIsSmall,
                                                    isSmall,
                                                    promosCards,
                                                    isInitialLoading,
                                                    isFetchingMore,
                                                    isRefetching,
                                                }) => {
    const dimStyle = isRefetching ? { opacity: 0.6 } : undefined;
    const selectedPromoCardIds = useCampaignBuilderStore((s) => s.selectedPromoCardIds);

    const selectedOfferAccountIds = useCampaignBuilderStore(
        (s) => s.selectedOfferAccountIds,
    );

    const isIncluded = React.useCallback(
        (card: PromoAccount) => selectedOfferAccountIds.includes(card.accountId),
        [selectedOfferAccountIds],
    );

    return (
        <div className={styles.block}>
            <div className={styles.main} style={dimStyle}>
                <div
                    className={`${styles.cardsContainer} ${
                        view === "table" ? styles.viewed : ""
                    }`}
                >
                    {view === "table" ? (
                        <div className={styles.promosGrid}>
                            <div
                                className={`${styles.promosGridHeader} ${
                                    isSmall ? styles.adaptive : ""
                                }`}
                            >
                                <div>Name</div>
                                <div>Price</div>
                                <div>Followers</div>
                                <div className={isSmall ? styles.center : ""}>Genres</div>
                                <div className={isSmall ? styles.center : ""}>Countries</div>
                            </div>

                            {isInitialLoading
                                ? Array.from({ length: 24 }).map((_, i) => (
                                    <TableCardSkeleton key={i} />
                                ))
                                : promosCards.map((card) => (
                                    <TableRowCard
                                        key={card.accountId}
                                        data={card}
                                        isInclude={isIncluded(card)}
                                        isSelected={selectedPromoCardIds.includes(card.accountId)}
                                        isSmall={isSmall}
                                        setIsSmall={setIsSmall}
                                    />
                                ))}
                        </div>
                    ) : isInitialLoading ? (
                        Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        promosCards.map((card) => (
                            <PromoCardGrid
                                key={card.accountId}
                                data={card}
                                isInclude={isIncluded(card)}
                                isSelected={selectedPromoCardIds.includes(card.accountId)}
                            />
                        ))
                    )}
                </div>

                {isRefetching && (
                    <div style={{ padding: 8, textAlign: "center" }}>Updating…</div>
                )}
            </div>

            {isFetchingMore && !isInitialLoading && (
                <div style={{ marginTop: "8px" }} className={styles.cardsContainer}>
                    {view === "table"
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <TableCardSkeleton key={`more-${i}`} />
                        ))
                        : Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={`more-${i}`} />
                        ))}
                </div>
            )}
        </div>
    );
};