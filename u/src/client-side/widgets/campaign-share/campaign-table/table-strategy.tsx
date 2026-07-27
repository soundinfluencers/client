import React from "react";
import "@/client-side/styles-table/table-base.scss";

import chevron from "@/assets/icons/chevron-up.svg";

import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";

import { TableCard } from "../card-table/table-card-strategy";
import type { TableGroup } from "@/client-side/types/table-types";
import {
  getTableColumnWidths,
  getTitle,
} from "@/client-side/data/table-campaign.data";
import { useFollowersSort } from "@/client-side/hooks";
import {getColumns} from "@/client-side/utils";
import {getCurrencySymbol} from "@/pages/influencer/negotiation/utils/getCurrencySymbol.ts";

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number | null;
  proposalsFlag?: boolean;
  group: TableGroup;
  title: string;
  campaign: {
    isPriceHidden: boolean;
    displayCurrency: string;
  };
};
const makeRowKey = (n: CampaignAddedAccount, index: number) =>
  String(n.addedAccountsId ?? n.socialAccountId ?? n._id ?? `${n.influencerId}-${index}`);

type ActiveDropdown = {
  rowKey: string;
  key: "date" | "content" | "postDescription";
} | null;

export function TableStrategy({
  items,
  networks,
  totalPrice,
  group,
  title,
  campaign,
}: Props) {

  const [networksState, setNetworksState] =
    React.useState<CampaignAddedAccount[]>(networks);
  React.useEffect(() => setNetworksState(networks), [networks]);

  const totalFollowers = React.useMemo(
    () =>
      networksState.reduce(
        (sum, n) => sum + Number(n.followers ?? 0),
        0,
      ),
    [networksState],
  );

  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(networks);
  const [active, setActive] = React.useState<ActiveDropdown>(null);

  const toggleDropdown = React.useCallback(
    (rowKey: string, key: NonNullable<ActiveDropdown>["key"]) => {
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

    return sortedNetworks.filter((n, index) => {
      const key = String(
        n.addedAccountsId ??
        n.socialAccountId ??
        n._id ??
        `${n.influencerId}-${index}`,
      );

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [sortedNetworks]);
  const columns = React.useMemo(
    () => getColumns(false, group, false),
    [group],
  );

  const widths = React.useMemo(
    () =>
      getTableColumnWidths({
        group,
        changeView: false,
        canEdit: false,
      }),
    [group],
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
                key={rowKey}
                rowKey={rowKey}
                data={network}
                items={items}
                group={group}
                activeDropdown={active}
                onToggleDropdown={toggleDropdown}
                onCloseDropdown={closeDropdown}
                canEdit={false}
                columns={columns}
              />
            );
          })}
        </tbody>

        <tfoot>
          <tr>
            {columns.map((col) => {
              const isPrice = col === "network";
              const isFollowers = col === "followers";

              return (
                <td
                  key={col}
                  className={`tableBase__td td--footer ${isPrice || isFollowers ? "td--footer-strategy" : ""}`}>
                  {isPrice && (
                    <p className="td__price">
                      Price: {campaign.isPriceHidden
                        ? ""
                        : `${totalPrice ?? 0}${getCurrencySymbol(campaign.displayCurrency)}`}
                    </p>
                  )}
                  {isFollowers && <p className="td__followers">{totalFollowers}</p>}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
