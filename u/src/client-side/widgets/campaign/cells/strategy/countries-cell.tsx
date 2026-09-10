import React from "react";

export const CountriesCell: React.FC<{ data: any }> = ({ data }) => {
  return (
    <td className="tableBase__td td-chips">
      <ul className="chips">
        {(data.countries ?? []).map((c: any) => (
          <li key={c.country}>
            {c.country} {c.percentage}%
          </li>
        ))}
      </ul>
    </td>
  );
};
