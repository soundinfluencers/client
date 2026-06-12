import React from "react";
import styles from './cells.module.scss'
import type { CampaignTableRow } from "../../model/campaign-table.types";

type Props = {
    row: CampaignTableRow;
};

export const FollowersTableCell: React.FC<Props> = ({ row }) => {
    return <p className={styles.followers}>{Number(row.account.followers ?? 0)}</p>;
};