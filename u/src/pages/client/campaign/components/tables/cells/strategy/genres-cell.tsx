import React from "react";

export const GenresCell: React.FC<{ data: any }> = ({ data }) => {
  return (
    <td className="table-strategy__td td-chips">
      <ul className="chips">
        {(data.genres ?? data.musicGenres ?? []).map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </td>
  );
};
