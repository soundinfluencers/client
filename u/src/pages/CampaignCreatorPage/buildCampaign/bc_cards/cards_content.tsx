import React from "react";
import { useCreateCampaign } from "../../../../store/createCampaign";
import "./_cards_content.scss";
import { Card } from "./card/card";
import { TableRowCard } from "./card/tableRowCard";
interface Props {
  view: number;
}

export const CardsContainer: React.FC<Props> = ({ view }) => {
  const { setPromoCards, promosCards } = useCreateCampaign();
  React.useEffect(() => {
    const fetchCards = async () => {
      await setPromoCards("instagram");
      console.log(useCreateCampaign.getState().promosCards);
    };
    fetchCards();
  }, []);
  return (
    // <div className={`containerCards ${view === 0 ? "viewed" : ""}`}>
    //   {view === 0 ? (
    //     <table className="promo-table">
    //       <thead>
    //         <tr>
    //           <th className="name">Name</th>
    //           <th className="price">Price</th>
    //           <th className="followers">Followers</th>
    //           <th className="genres">Genres</th>
    //           <th className="countries">Countries</th>
    //         </tr>
    //       </thead>

    //       <tbody>
    //         {promosCards?.slice(0, 12)?.map((card) => (
    //           <TableRowCard key={card._id} data={card} />
    //         ))}
    //       </tbody>
    //     </table>
    //   ) : (
    //     promosCards
    //       ?.slice(0, 12)
    //       ?.map((card) => <Card key={card._id} data={card} view={view} />)
    //   )}
    // </div>
  );
};
