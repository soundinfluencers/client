import React from "react";
import { getAccountTaxonomyGroups } from "@/widgets/client-side/campaign-tables/model/account-taxonomy";

export const GenresCell: React.FC<{ data: any }> = ({ data }) => {
  const taxonomy = getAccountTaxonomyGroups({ ...data, genres: data.genres ?? data.musicGenres });
  const items = [...new Map(taxonomy.flatMap(group => group.items).map(item => [`${item.value}:${item.label}`, item])).values()];
  return <td className="tableBase__td td-chips"><ul className="chips">
    {items.map(item => <li key={`${item.value}:${item.label}`}>{item.label}</li>)}
  </ul></td>;
};
