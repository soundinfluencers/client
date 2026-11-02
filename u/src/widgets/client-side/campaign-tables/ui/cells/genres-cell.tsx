import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";
import { getAccountTaxonomyGroups } from "../../model/account-taxonomy";

type Props = {
  row: StrategyRow;
};

export const GenresCell: React.FC<Props> = ({ row }) => {
  const groups = getAccountTaxonomyGroups(row.account);

  if (!groups.length) {
    return <p className="hidden-text">—</p>;
  }

  return (
    <div className="td-chips">
      {groups.map((group) =>
        <div key={group.title}>
          <ul className="chips">{group.items.map((item) => <li key={item.value}>{item.label}</li>)}</ul>
        </div>,
      )}
    </div>
  );
};
