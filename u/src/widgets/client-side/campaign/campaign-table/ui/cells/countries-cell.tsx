import React from "react";

import type { CampaignTableRow } from "../../model/campaign-table.types";

import styles from "./cells.module.scss";

type Props = {
    row: CampaignTableRow;
};

export const CountriesCell: React.FC<Props> = ({ row }) => {
    const countries = row.account.countries ?? [];

    if (!countries.length) {
        return <p className={styles.empty}>—</p>;
    }

    return (
        <div className={styles.chipsWrapper}>
            <ul className={styles.chips}>
                {countries.map((item) => (
                    <li key={`${item.country}-${item.percentage}`}>
                        {item.country} {item.percentage}%
                    </li>
                ))}
            </ul>
        </div>
    );
};