import React from "react";
import type { TableGroup } from "../types/table-types";

type Props = {
  changeView: boolean;
  group: TableGroup;
  isMusic?: boolean;
  platformItems: any[];
  selectedContent: number;
};

export const ExtraFieldsCells: React.FC<Props> = ({
  changeView,
  group,
  platformItems,
  selectedContent,
}) => {
  if (changeView) return null;

  const keys = (() => {
    switch (group) {
      case "music":
        return ["additionalBrief"] as const;

      case "main":
        return ["taggedUser", "taggedLink", "additionalBrief"] as const;

      case "press":
        return ["additionalBrief"] as const;

      default:
        return [] as const;
    }
  })();

  return (
    <>
      {keys.map((key) => (
        <td key={key} className="table-strategy__td">
          <p
            className="ellipsis"
            title={platformItems?.[selectedContent]?.[key]}>
            {platformItems?.[selectedContent]?.[key] || "—"}
          </p>
        </td>
      ))}
    </>
  );
};
