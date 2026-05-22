import React from "react";
import { Link } from "react-router-dom";
type TableGroup = "main" | "music" | "press";

type Props = {
  group: TableGroup;
  platformItems: any[];
  selectedContent: number;changeView?: boolean;
};

export const ExtraFieldsCells = React.memo(function ExtraFieldsCells({
                                                                       group,
                                                                       platformItems,
                                                                       selectedContent,
                                                                       changeView,
                                                                     }: Props) {
  const keys = React.useMemo(() => {
    if (changeView) {
      return group === "press" ? (["additionalBrief"] as const) : ([] as const);
    }

    switch (group) {
      case "music":
        return ["additionalBrief"] as const;
      case "main":
        return ["taggedUser", "taggedLink", "additionalBrief"] as const;
      case "press":
        return ["mainLink", "taggedLink", "additionalBrief"] as const;
      default:
        return [] as const;
    }
  }, [group, changeView]);

  const normalizeLink = React.useCallback((value: string) => {
    return value.startsWith("http") ? value : `https://${value}`;
  }, []);

  return (
      <>
        {keys.map((key) => {
          const rawValue = platformItems?.[selectedContent]?.[key];
          const value = String(rawValue ?? "").trim();
          const isLink = key === "taggedLink" || key === "mainLink";

          return (
              <td key={key} className="tableBase__td">
                {isLink && value ? (
                    <Link
                        className="hidden-text tagged-link"
                        to={normalizeLink(value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={value}
                    >
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
