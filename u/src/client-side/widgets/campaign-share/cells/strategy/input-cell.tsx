import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
};

export const InputCell: React.FC<Props> = ({
  value,
  onChange,
  multiline,
  placeholder = "—",
}) => {
  return (
    <td className="tableBase__td">
      {multiline ? (
        <textarea
          className="table-input table-input--textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="table-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </td>
  );
};
