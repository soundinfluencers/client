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
  loading: boolean;
}

export const CardsContainer: React.FC<Props> = ({
  view,
  setIsSmall,
  isSmall,
  promosCards,
  loading,
}) => {
  return (
    <div className="card-container-block">
      <div className={`cards-container ${view === 0 ? "viewed" : ""}`}>
        {view === 0 ? (
          <div className="promos-grid">
            <div className={`promos-grid__header ${isSmall ? "adaptive" : ""}`}>
              <div>Name</div>
              <div>Price</div>
              <div>Followers</div>
              <div className={`${isSmall ? "center" : ""}`}>Genres</div>
              <div className={`${isSmall ? "center" : ""}`}>Countries</div>
            </div>
            {loading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <TableCardSkeleton key={index} />
                ))
              : promosCards?.map((card) => (
                  <TableRowCard
                    key={card.accountId}
                    data={card}
                    isInclude={false}
                    isSmall={isSmall}
                    setIsSmall={setIsSmall}
                  />
                ))}
          </div>
        ) : loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          promosCards?.map((card) => (
            <Card key={card.accountId} data={card} isInclude={false} />
          ))
        )}
      </div>
    </div>
  );
};
