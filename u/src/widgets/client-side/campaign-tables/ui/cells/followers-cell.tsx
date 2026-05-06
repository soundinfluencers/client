import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";

type Props = {
    row: StrategyRow;
};

export const FollowersCell: React.FC<Props> = ({ row }) => {
    return <p className="followers">{Number(row.account.followers ?? 0)}</p>;
};