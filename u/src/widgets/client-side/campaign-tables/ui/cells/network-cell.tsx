import React from "react";
import {getSocialMediaIcon} from "@/constants/social-medias";
import type { SocialMediaType } from "@/shared/types/utils/constants.types";
import type { StrategyRow } from "../../model/campaign-strategy.types";

type Props = {
    row: StrategyRow;
};

export const NetworkCell: React.FC<Props> = ({ row }) => {
    const account = row.account;

    return (
        <div className="username_row">
            <img
                src={
                    getSocialMediaIcon(
                        account.socialMedia as SocialMediaType,
                    ) || ""
                }
                alt={account.socialMedia}
            />
            <p className="hidden-text username">{account.username || "—"}</p>
        </div>
    );
};