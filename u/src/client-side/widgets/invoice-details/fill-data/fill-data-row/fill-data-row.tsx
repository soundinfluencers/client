import React from "react";
import "./_fill-data-row.scss";

interface Props {
  key: string;
  label: string;
  name: string;
}

export const FillDataRow: React.FC<Props> = ({ label, name, key }) => {
  return (
    <div className="fill-data-row">
      <p className="fill-data-row__label">{label}</p>
      <p className="fill-data-row__name">{name}</p>
    </div>
  );
};
