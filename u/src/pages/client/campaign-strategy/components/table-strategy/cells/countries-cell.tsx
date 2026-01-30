import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const CountriesCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="table-strategy__td td-chips">
      {data.countries.length > 0 ? (
        <ul className="chips">
          {(data.countries ?? []).map((c: any) => (
            <li key={c.country}>{c.country}</li>
          ))}
        </ul>
      ) : (
        "no countries"
      )}
    </td>
  );
};
