import React from "react";
import { FillDataRow } from "./fill-data-row/fill-data-row";
import "./_fill-data.scss";
interface Props {
  data: Record<string, any>;
  fields: { key: string; label: string }[];
}

export const FillData: React.FC<Props> = ({ data, fields }) => {
  return (
    <div className="Fill-Data">
      {fields.map(({ key, label }) => (
        <FillDataRow key={key} label={label} name={data[key] || "—"} />
      ))}
    </div>
  );
};
