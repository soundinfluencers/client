import React from "react";
import type { NetworkRowResolved } from "../../types";

export const FollowersCell: React.FC<{ data: NetworkRowResolved }> = ({
  data,
}) => {
  return (
    <td className="table-campaign-page__td">
      <p className="followers">{(data as any).followers}</p>
    </td>
  );
};
