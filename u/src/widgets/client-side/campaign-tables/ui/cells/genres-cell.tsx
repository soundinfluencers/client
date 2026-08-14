import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";
import {
    getCampaignCategoryLabel,
} from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-category-labels";

type Props = {
    row: StrategyRow;
};

export const GenresCell: React.FC<Props> = ({ row }) => {
    const genres = [
        ...new Set(row.account.genres ?? []),
    ].map((genre) => ({
        key: genre,
        label: getCampaignCategoryLabel(genre),
    }));

    if (!genres.length) {
        return <p className="hidden-text">—</p>;
    }

    return (
        <div className="td-chips">
            <ul className="chips">
                {genres.map((genre) => (
                    <li key={genre.key}>{genre.label}</li>
                ))}
            </ul>
        </div>
    );
};
