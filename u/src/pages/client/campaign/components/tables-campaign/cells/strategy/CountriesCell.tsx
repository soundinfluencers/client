import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const CountriesCell: React.FC<{ data: any }> = ({ data }) => {
  return (
    <td className="table-strategy__td td-chips">
      <ul className="chips">
        {(data.countries ?? []).map((c: any) => (
          <li key={c.country}>{c.country}</li>
        ))}
      </ul>
    </td>
  );
};
