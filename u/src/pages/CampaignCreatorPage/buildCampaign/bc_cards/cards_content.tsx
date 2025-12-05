import React from "react";
import { useCreateCampaign } from "../../../../store/createCampaign";
import "./_cards_content.scss";
import { Card } from "./bc_card/card";
import { TableRowCard } from "./bc_card/tableRowCard";
import { Loader } from "../../../../components/ui/loader/loader";

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
  const { setPromoCards, promosCards, loading } = useCreateCampaign();

  const [cardsCount, setCardsCount] = React.useState(20);

  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const lastElementRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setPromoCards("instagram");
  }, []);

  React.useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];

      if (target.isIntersecting) {
        setCardsCount((prev) => prev + 12);
      }
    });

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading]);

  const cards = promosCards.slice(0, cardsCount);

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
                key={card._id}
                isSmall={isSmall}
                setIsSmall={setIsSmall}
                data={card}
              />
            ))}
          </div>
        ) : (
          cards.map((card) => <Card key={card._id} view={view} data={card} />)
        )}
      </div>

      <div
        ref={lastElementRef}
        style={{
          marginTop: "50px",
          backgroundColor: "transparent",
          width: "100%",
          height: "50px",
        }}
      />

      {loading && <Loader />}
    </div>
  );
};
