import React from "react";

export const CountriesCell: React.FC<{ data: any }> = ({ data }) => {
  return (
    <td className="tableBase__td td-chips">
      <ul className="chips country-chips">
        {(data.countries ?? []).map((c: any) => (
          <li key={c.country}>
            <span className="country-chips__name">{c.country}</span> <span className="country-chips__percentage">{c.percentage}%</span>
          </li>
        ))}
      </ul>
    </td>
  );
};
