import React from "react";
import type { CampaignAddedAccount } from "@/types/store/index.types";

type Props = { data: CampaignAddedAccount };

export const FollowersCell = React.memo(function FollowersCell({
  data,
}: Props) {
  return (
    <td className="table-campaign-page__td">
      <p className="followers">{(data as any).followers}</p>
    </td>
  );
});
