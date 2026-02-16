import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

type Props = { data: IPromoCard };

export const CountriesCell = React.memo(function CountriesCell({
  data,
}: Props) {
  const countries = data.countries ?? [];
  console.log(data);
  return (
    <td className="tableBase__td td-chips">
      {countries.length > 0 ? (
        <ul className="chips">
          {countries.map((c: any) => (
            <li key={c.country}>
              {c.country} {c.percentage}%
            </li>
          ))}
        </ul>
      ) : (
        "no countries"
      )}
    </td>
  );
});
