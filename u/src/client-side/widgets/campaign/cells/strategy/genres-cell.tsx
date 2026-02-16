import React from "react";

export const GenresCell: React.FC<{ data: any }> = ({ data }) => {
  return (
    <td className="tableBase__td td-chips">
      <ul className="chips">
        {(data.genres ?? data.musicGenres ?? []).map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </td>
  );
};
