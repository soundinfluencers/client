import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const GenresCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="table-strategy__td td-chips">
      <ul className="chips">
        {(data.musicGenres ?? []).map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </td>
  );
};
