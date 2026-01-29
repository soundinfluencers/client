import React from "react";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const FollowersCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="table-strategy__td">
      <p className="followers">{data.followers}</p>
    </td>
  );
};
