import type { TableGroup } from "@/client-side/types/table-types";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  group: TableGroup;
  platformItems: any[];
  selectedContent: number;
};

export const ExtraFieldsCells = React.memo(function ExtraFieldsCells({
  group,
  platformItems,
  selectedContent,
}: Props) {
  const keys = React.useMemo(() => {
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
  }, [group]);

  const normalizeLink = React.useCallback((value: string) => {
    return value.startsWith("http") ? value : `https://${value}`;
  }, []);

  return (
    <>
      {keys.map((key) => {
        const value = platformItems?.[selectedContent]?.[key];

        return (
          <td key={key} className="tableBase__td">
            {key === "taggedLink" && value ? (
              <Link
                className="hidden-text tagged-link"
                to={normalizeLink(value)}
                target="_blank"
                title={value}>
                {value}
              </Link>
            ) : (
              <p className="hidden-text" title={value}>
                {value || "—"}
              </p>
            )}
          </td>
        );
      })}
    </>
  );
});
