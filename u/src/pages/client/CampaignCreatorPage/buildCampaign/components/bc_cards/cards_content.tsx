import React from "react";
import {
  useCreateCampaign,
  useFilter,
  useCampaignStore,
} from "@/store/client/createCampaign";
import "./_cards_content.scss";
import { Card } from "./bc_card/card";
import { TableRowCard } from "./bc_card/tableRowCard";
import { Loader } from "@/components/ui/loader/loader";
import { useCreateCampaignPlatform } from "@/store/client/createCampaign/useCreate-campaign-fetch";

interface Props {
  view: number;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
  isSmall: boolean;
}

export const CardsContainer: React.FC<Props> = ({
  view,
  setIsSmall,
  isSmall,
}) => {
  const { promosCards, loading, getMatchedAccountIds } = useCreateCampaign();

  const { offer } = useCampaignStore();
  console.log(promosCards, "aw;kjmawd;");
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const lastElementRef = React.useRef<HTMLDivElement | null>(null);

  // React.useEffect(() => {
  //   if (loading) return;

  //   if (observerRef.current) observerRef.current.disconnect();

  //   observerRef.current = new IntersectionObserver((entries) => {
  //     const target = entries[0];

  //     if (target.isIntersecting) {
  //       setCardsCount((prev) => prev + 12);
  //     }
  //   });

  //   if (lastElementRef.current) {
  //     observerRef.current.observe(lastElementRef.current);
  //   }

  //   return () => {
  //     observerRef.current?.disconnect();
  //   };
  // }, [loading]);

  const cards = promosCards.slice(0, 20);
  const matched = getMatchedAccountIds(offer);
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

            {cards.map((card) => (
              <TableRowCard
                isInclude={matched.has(card.accountId)}
                key={card.accountId}
                isSmall={isSmall}
                setIsSmall={setIsSmall}
                data={card}
              />
            ))}
          </div>
        ) : (
          cards.map((card) => (
            <Card
              isInclude={matched.has(card.accountId)}
              key={card.accountId}
              data={card}
            />
          ))
        )}
      </div>

      <div
        ref={lastElementRef}
        style={{
          marginTop: "64px",
          backgroundColor: "transparent",
          width: "100%",
          height: "50px",
        }}
      />
    </div>
  );
};
