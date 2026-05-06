import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";

type Props = {
    row: StrategyRow;
};

export const GenresCell: React.FC<Props> = ({ row }) => {
    const genres = row.account.genres ?? [];

    if (!genres.length) {
        return <p className="hidden-text">—</p>;
    }

    return (
        <div className="td-chips">
            <ul className="chips">
                {genres.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
};