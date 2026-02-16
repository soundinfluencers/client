import React from "react";

type Props = { data: any };

export const FollowersCell = React.memo(function FollowersCell({
  data,
}: Props) {
  return (
    <td className="table-campaign-page__td">
      <p className="followers">{(data as any).followers}</p>
    </td>
  );
});
