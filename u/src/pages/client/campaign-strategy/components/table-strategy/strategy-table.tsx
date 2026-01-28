import React from "react";
import "../../../scss-campaign-table/table-base.scss";

import { useCampaignStore } from "@/store/client/createCampaign";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

import type { DropdownState, TableGroup } from "./types/tableTypes";
import { useFollowersSort } from "./sorting/useFollowersSort";

import { TableHeader } from "./components/TableHeader";
import { TableFooter } from "./components/TableFooter";
import { getColumns } from "./utils/getColums";
import { TableCard } from "./table-card/table-card";

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
  isMusic,
  networks,
  group,
}: {
  isMusic?: boolean;
  changeView: boolean;
  items: any[];
  networks: any[];
  group: TableGroup;
}) {
  const { totalPrice } = useCampaignStore();

  const columns = React.useMemo(
    () => getColumns(changeView, isMusic),
    [changeView, isMusic],
  );

  const [dropdownsOpen, setDropdownsOpen] = React.useState<DropdownState>({});
  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(networks);

  const totalFollowers = React.useMemo(
    () => networks.reduce((sum, n) => sum + Number(n.followers ?? 0), 0),
    [networks],
  );

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
              isMusic={isMusic}
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
