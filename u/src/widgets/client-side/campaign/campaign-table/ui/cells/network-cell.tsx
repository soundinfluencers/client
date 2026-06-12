import React from "react";

import type { CampaignTableRow } from "../../model/campaign-table.types";
import type {
    TSocialMedia
} from "@/pages/influencer/promos/distributing/components/campaign-result-form/types/campaign-result-form.types.ts";
import {getSocialMediaIcon} from "@/constants/social-medias.ts";
import styles from './cells.module.scss'

type Props = {
    row: CampaignTableRow;
};

export const NetworkTableCell: React.FC<Props> = ({ row }) => {
    const account = row.account;

    return (
        <div className={styles.network}>
            <img
                src={getSocialMediaIcon(account.socialMedia as TSocialMedia) || ""}
                alt={account.socialMedia}
            />

            <p title={account.username} className="hidden-text username">
                {account.username || "—"}
            </p>
        </div>
    );
};