import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

type Props = { data: IPromoCard };

export const GenresCell = React.memo(function GenresCell({ data }: Props) {
  const genres = data.musicGenres ?? [];

  return (
    <td className="tableBase__td td-chips">
      {genres.length > 0 ? (
        <ul className="chips">
          {genres.map((item: any) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        "no genres"
      )}
    </td>
  );
});
