import React from "react";
import type { NetworkRowResolved } from "../../types";

type Props = {
  data: NetworkRowResolved;
};

export const DescriptionCellReadonly: React.FC<Props> = ({ data }) => {
  const activeDescription = data.resolvedDescription;

  return (
    <td className="table-campaign-page__td">
      <p className="ellipsis" title={String(activeDescription?.description)}>
        {activeDescription?.description ?? "—"}
      </p>
    </td>
  );
};
