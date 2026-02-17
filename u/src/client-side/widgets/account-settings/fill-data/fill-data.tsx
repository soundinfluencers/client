import React from "react";

import "./_fill-data.scss";
import { FillDataRow } from "./fill-data-row/fill-data-row";
import { useLocalProfileStore } from "@/client-side/store/mock-photo/mock-photo";

interface Props {
  data: Record<string, any>;
  fields: { key: string; label: string }[];
}

export const FillData: React.FC<Props> = ({ data, fields }) => {
  console.log(data, "data");
  return (
    <div className="Fill-Data">
      {fields.map(({ key, label }) => {
        if (key === "logoUrl") {
          return (
            <div key={key} className="fill-data-row">
              <div className="fill-data-row__label">
                {label ?? "Profile Photo"}
              </div>

              <div className="fill-data-row__name">
                {data?.logoUrl ? (
                  <img
                    style={{
                      height: "40px",
                      width: "40px",
                      borderRadius: "50%",
                    }}
                    src={data?.logoUrl}
                    alt="Profile"
                    className="profile-photo-row__img"
                  />
                ) : (
                  <span>No photo</span>
                )}
              </div>
            </div>
          );
        }

        return (
          <FillDataRow
            key={key}
            label={label}
            name={key === "password" ? "*********" : data?.[key]}
          />
        );
      })}
    </div>
  );
};
