import React from "react";
import "@/client-side/styles-table/table-base.scss";

export type DropdownKey = "date" | "content" | "description";
export type TableView = "main" | "music" | "press";
export type RowSelections = {
  date: string;
  dateValue?: string;
  content: string;
  description: string;
};

export type OpenDropdown = {
  rowIndex: number;
  key: DropdownKey;
} | null;

import { TableHeader } from "../components/table-header";
import { TableFooter } from "../components/table-footer";

import { TableCard } from "../card-table/table-card";
import type {
  DropdownState,
  DropKey,
  TableGroup,
} from "@/client-side/types/table-types";
import { getColumns } from "@/client-side/utils";

import { useFollowersSort } from "@/client-side/hooks";
import { useCampaignStore } from "@/client-side/store";

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
  const [activeDropdown, setActiveDropdown] = React.useState<any>(null);
  const columns = React.useMemo(
    () => getColumns(changeView, group, false),
    [changeView, group],
  );

  const [dropdownsOpen, setDropdownsOpen] = React.useState<DropdownState>({});
  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(networks);

  const totalFollowers = React.useMemo(
    () => networks.reduce((sum, n) => sum + Number(n.followers ?? 0), 0),
    [networks],
  );
  const isOpen = React.useCallback(
    (indexCard: number, key: DropKey) =>
      activeDropdown?.indexCard === indexCard && activeDropdown?.key === key,
    [activeDropdown],
  );

  const toggleOpen = React.useCallback((indexCard: number, key: DropKey) => {
    setActiveDropdown((prev) => {
      const same = prev?.indexCard === indexCard && prev?.key === key;
      return same ? null : { indexCard, key };
    });
  }, []);
  const closeAny = React.useCallback(() => setActiveDropdown(null), []);
  const uniqueNetworks = React.useMemo(() => {
    const seen = new Set<string>();
    return sortedNetworks.filter((n) => {
      const key = String((n as any).accountId ?? (n as any)._id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sortedNetworks]);
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
          {uniqueNetworks.map((network, index) => (
            <TableCard
              key={network.accountId ?? `${network.influencerId}-${index}`}
              data={network}
              indexCard={index}
              columns={columns}
              items={items}
              group={group}
              changeView={changeView}
              dropdownsOpen={dropdownsOpen}
              setDropdownsOpen={setDropdownsOpen}
              isOpen={isOpen}
              toggleOpen={toggleOpen}
              closeAny={closeAny}
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
