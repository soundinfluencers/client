import React from "react";

import type { CampaignTableRow } from "../../model/campaign-table.types";

import styles from "./cells.module.scss";

type Props = {
    row: CampaignTableRow;
};

export const GenresCell: React.FC<Props> = ({ row }) => {
    const genres = row.account.genres ?? [];
    if (!genres.length) {
        return <p className={styles.empty}>—</p>;
    }

    return (
        <div className={styles.chipsWrapper}>
            <ul className={styles.chips}>
                {genres.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
};