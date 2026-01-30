import React from "react";
import "../../../scss-campaign-table/table-base.scss";

import { useCampaignStore } from "@/store/client/create-campaign";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

import type { DropdownState, TableGroup } from "./types/table-types";
import { useFollowersSort } from "./sorting/use-followers-sort";

import { TableHeader } from "./components/table-header";
import { TableFooter } from "./components/table-footer";
import { getColumns } from "./utils/get-colums";
import { TableCard } from "./card-table/table-card";

const COL_WIDTH_LOCAL: Partial<Record<string, number>> = {
  network: 205,
  followers: 96,
  genres: 300,
  countries: 300,
  content: 130,
  description: 190,
  date: 113,
  tag: 113,
  link: 113,
  brief: 150,
  tracklink: 200,
  tracktitle: 200,
};

export function TableStrategy({
  changeView,
  items,

  networks,
  group,
}: {
  changeView: boolean;
  items: any[];
  networks: any[];
  group: TableGroup;
}) {
  const { totalPrice } = useCampaignStore();

  const columns = React.useMemo(
    () => getColumns(changeView, group),
    [changeView, group],
  );

  const [dropdownsOpen, setDropdownsOpen] = React.useState<DropdownState>({});
  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(networks);

  const totalFollowers = React.useMemo(
    () => networks.reduce((sum, n) => sum + Number(n.followers ?? 0), 0),
    [networks],
  );
  console.log(items);
  return (
    <div className="tableBase-wrap">
      <table className="tableBase ">
        <colgroup>
          {columns.map((key) => (
            <col
              key={key}
              style={
                COL_WIDTH_LOCAL[key]
                  ? { width: `${COL_WIDTH_LOCAL[key]}px` }
                  : undefined
              }
            />
          ))}
        </colgroup>

        <TableHeader
          columns={columns}
          followersSort={followersSort}
          onToggleFollowersSort={toggleFollowersSort}
        />

        <tbody>
          {sortedNetworks.map((row, index) => (
            <TableCard
              key={row.accountId ?? `${row.influencerId}-${index}`}
              data={row}
              indexCard={index}
              columns={columns}
              items={items}
              group={group}
              changeView={changeView}
              dropdownsOpen={dropdownsOpen}
              setDropdownsOpen={setDropdownsOpen}
            />
          ))}
        </tbody>

        <TableFooter
          columns={columns}
          totalPrice={totalPrice}
          totalFollowers={totalFollowers}
        />
      </table>
    </div>
  );
}
