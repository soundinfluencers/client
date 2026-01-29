import React from "react";
import {
  useCreateCampaign,
  useCampaignStore,
} from "@/store/client/createCampaign";
import "../../scss-module/_cards_content.scss";

import { Card } from "./bc-card/card";
import { TableRowCard } from "./bc-card/table-row-card";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

interface Props {
  view: number;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
  isSmall: boolean;
  promosCards: IPromoCard[];
}

export const CardsContainer: React.FC<Props> = ({
  view,
  setIsSmall,
  isSmall,
  promosCards,
}) => {
  const offer = useCampaignStore((s) => s.offer);
  const getMatchedAccountIds = useCreateCampaign((s) => s.getMatchedAccountIds);

  const matchedIds = React.useMemo(() => {
    if (!offer) return new Set<string>();
    return getMatchedAccountIds(offer);
  }, [offer, getMatchedAccountIds]);

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

            {promosCards?.map((card) => (
              <TableRowCard
                key={card.accountId}
                data={card}
                isInclude={matchedIds.has(card.accountId)}
                isSmall={isSmall}
                setIsSmall={setIsSmall}
              />
            ))}
          </div>
        ) : (
          promosCards?.map((card) => (
            <Card
              key={card.accountId}
              data={card}
              isInclude={matchedIds.has(card.accountId)}
            />
          ))
        )}
      </div>
    </div>
  );
};
