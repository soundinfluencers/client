import React from "react";

type Props = {
  changeView: boolean;
  isMusic?: boolean;
  platformItems: any[];
  selectedContent: number;
};

export const ExtraFieldsCells: React.FC<Props> = ({
  changeView,
  isMusic,
  platformItems,
  selectedContent,
}) => {
  if (changeView) return null;

  const keys = isMusic
    ? (["additionalBrief"] as const)
    : (["taggedUser", "taggedLink", "additionalBrief"] as const);

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
