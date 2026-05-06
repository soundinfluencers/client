import React from "react";
import "@/client-side/styles-table/table-base.scss";

import chevron from "@/assets/icons/chevron-up.svg";

import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";

import { TableCard } from "../card-table/table-card-strategy";
import {
  getTableColumnWidths,
  getTitle,
  getWidthColumn,
} from "@/client-side/data/table-campaign.data";
import { useFollowersSort } from "@/client-side/hooks";
import type { TableGroup } from "@/client-side/types/table-types";
import { getColumns } from "@/client-side/utils";

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number;
  proposalsFlag?: boolean;
  group: TableGroup;
  canEdit: boolean;
  campaignId: string;
  changeView?: boolean;
  title: string;
  status: string
};
type ColumnKey = keyof ReturnType<typeof getWidthColumn>;
const makeRowKey = (n: CampaignAddedAccount, index: number) =>
  String((n as any).accountId ?? `${(n as any).influencerId}-${index}`);

type ActiveDropdown = {
  rowKey: string;
  key: "date" | "content" | "postDescription";
} | null;

export function TableStrategy({
  items,
  networks,
  totalPrice,
  campaignId,
  group,
  canEdit,
  changeView,
  title,
    status,
}: Props) {
  console.log(items, "items");

  const totalFollowers = React.useMemo(
    () =>
      networks.reduce((sum, n) => sum + Number((n as any).followers ?? 0), 0),
    [networks],
  );

  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(networks);
  const [active, setActive] = React.useState<ActiveDropdown>(null);

  const toggleDropdown = React.useCallback(
    (rowKey: string, key: ActiveDropdown extends null ? never : any) => {
      setActive((prev) =>
        prev && prev.rowKey === rowKey && prev.key === key
          ? null
          : { rowKey, key },
      );
    },
    [],
  );
  const closeDropdown = React.useCallback(() => setActive(null), []);
  const uniqueNetworks = React.useMemo(() => {
    const seen = new Set<string>();
    return sortedNetworks.filter((n) => {
      const key = String((n as any).addedAccountsId ?? (n as any)._id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sortedNetworks]);

  const columns = React.useMemo(
      () => getColumns(changeView ?? false, group, false),
      [group, canEdit, changeView],
  );
  console.log(uniqueNetworks);
  const widths = React.useMemo(
      () =>
          getTableColumnWidths({
            group,
            changeView: false,
            canEdit: false,
          }),
      [group, changeView, canEdit],
  );
  return (
    <div className="tableBase-wrap">
      <h1>{title}</h1>
      <table className="tableBase border-table">
        <colgroup>
          {columns.map((key) => (
              <col
                  key={key}
                  style={widths[key] ? { width: `${widths[key]}px` } : undefined}
              />
          ))}
        </colgroup>

        <thead>
          <tr>
            {columns.map((key) => (
              <th key={key} className="tableBase__th">
                <div className="header-content">
                  <span className="th-title">{getTitle(group, key)}</span>

                  {key === "followers" && (
                    <div className="switch" aria-label="Sort by followers">
                      <button
                        type="button"
                        className={`switch-btn ${followersSort === "desc" ? "active" : ""}`}
                        onClick={() => toggleFollowersSort("desc")}
                        aria-pressed={followersSort === "desc"}
                        title="Sort desc">
                        <img className="up" src={chevron} alt="" />
                      </button>

                      <button
                        type="button"
                        className={`switch-btn ${followersSort === "asc" ? "active" : ""}`}
                        onClick={() => toggleFollowersSort("asc")}
                        aria-pressed={followersSort === "asc"}
                        title="Sort asc">
                        <img className="down" src={chevron} alt="" />
                      </button>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {uniqueNetworks.map((network, index) => {
            const rowKey = makeRowKey(network, index);
            return (
              <TableCard
                columns={columns}
                campaignId={campaignId}
                key={rowKey}
                rowKey={rowKey}
                data={network}
                items={items}
                group={group}
                activeDropdown={active}
                onToggleDropdown={toggleDropdown}
                onCloseDropdown={closeDropdown}
                canEdit={canEdit}
                changeView={changeView}
                status={status}
              />
            );
          })}
        </tbody>

        <tfoot>
          {/* {status === "proposal" && (
              <tr>
                <td className="add-influencer-main">
                  <div className="add-influencer">
                    <img src={plus} alt="" />
                    <p>Add Influencer</p>
                  </div>
                </td>
              </tr>
            )} */}
          <tr>
            {columns.map((col) => {
              const isPrice = col === "network";
              const isFollowers = col === "followers";

              return (
                <td
                  key={col}
                  className={`tableBase__td td--footer ${isPrice ? "td--footer-strategy" : ""} ${isFollowers ? "td--footer-strategy" : ""}`}>
                  {isPrice && <p className="td__price">Price: {totalPrice}€</p>}
                  {isFollowers && (
                    <p className="td__followers">{totalFollowers}</p>
                  )}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
