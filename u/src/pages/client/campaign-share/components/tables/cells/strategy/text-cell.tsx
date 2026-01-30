// src/pages/campaign/table/strategy/components/cells/TextCell.tsx
import React from "react";

type Props = {
  value?: React.ReactNode;
  multiline?: boolean;
  placeholder?: string;
};

export const TextCell: React.FC<Props> = ({
  value,
  multiline,
  placeholder = "—",
}) => {
  const content = value ?? placeholder;

  return (
    <td className="table-campaign-page__td">
      {multiline ? (
        <p title={String(content)} className="table-text table-text--multiline">
          {content}
        </p>
      ) : (
        <p title={String(content)} className="ellipsis">
          {content}
        </p>
      )}
    </td>
  );
};
