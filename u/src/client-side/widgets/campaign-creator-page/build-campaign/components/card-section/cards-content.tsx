import React from "react";
import {
  useCreateCampaign,
  useCampaignStore,
} from "@/store/client/create-campaign";
import "./_cards_content.scss";

import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";
import { TableRowCard } from "./components/table-row-card";
import { Card } from "./components/card-grid";
import { TableCardSkeleton } from "@/components/ui/skeletons/table-card-skeleton";
import { CardSkeleton } from "@/components/ui/skeletons/card-skeleton";

interface Props {
  view: number;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
  isSmall: boolean;
  promosCards: IPromoCard[];
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

  return (
    <div className="card-container-block">
      <div className="cards-main" style={dimStyle}>
        <div className={`cards-container ${view === 0 ? "viewed" : ""}`}>
          {view === 0 ? (
            <div className="promos-grid">
              <div
                className={`promos-grid__header ${isSmall ? "adaptive" : ""}`}>
                <div>Name</div>
                <div>Price</div>
                <div>Followers</div>
                <div className={`${isSmall ? "center" : ""}`}>Genres</div>
                <div className={`${isSmall ? "center" : ""}`}>Countries</div>
              </div>

              {isInitialLoading
                ? Array.from({ length: 24 }).map((_, i) => (
                    <TableCardSkeleton key={i} />
                  ))
                : promosCards.map((card) => (
                    <TableRowCard
                      key={card.accountId}
                      data={card}
                      isInclude={false}
                      isSmall={isSmall}
                      setIsSmall={setIsSmall}
                    />
                  ))}
            </div>
          ) : isInitialLoading ? (
            Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            promosCards.map((card) => (
              <Card key={card.accountId} data={card} isInclude={false} />
            ))
          )}
        </div>

        {isRefetching && (
          <div style={{ padding: 8, textAlign: "center" }}>Updating…</div>
        )}
      </div>

      {isFetchingMore && !isInitialLoading && (
        <div style={{ marginTop: "8px" }} className="cards-container">
          {view === 0
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
