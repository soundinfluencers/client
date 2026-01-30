import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const GenresCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="table-strategy__td td-chips">
      {data.musicGenres.length > 0 ? (
        <ul className="chips">
          {(data.musicGenres ?? []).map((item: any) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        "no genres"
      )}
    </td>
  );
};
