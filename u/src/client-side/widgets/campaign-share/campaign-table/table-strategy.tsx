import React from "react";
import "@/client-side/styles-table/table-base.scss";

import chevron from "@/assets/icons/chevron-up.svg";

import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";
import plus from "@/assets/icons/plus-square.svg";

import { TableCard } from "../card-table/table-card-strategy";
import { useFetchCampaign } from "@/store/client/campaign-page";
import type {
  DropdownState,
  TableGroup,
} from "@/client-side/types/table-types";
import {
  columnsStrategy,
  getWidthColumn,
  titles,
} from "@/client-side/data/table-campaign.data";
import { useFollowersSort } from "@/client-side/hooks";

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number;
  proposalsFlag?: boolean;
  group: TableGroup;
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
  proposalsFlag,
  group,
}: Props) {
  const { status } = useFetchCampaign();

  const [networksState, setNetworksState] =
    React.useState<CampaignAddedAccount[]>(networks);
  React.useEffect(() => setNetworksState(networks), [networks]);

  const [dropdownsOpen, setDropdownsOpen] = React.useState<DropdownState>({});

  const totalFollowers = React.useMemo(
    () =>
      networksState.reduce(
        (sum, n) => sum + Number((n as any).followers ?? 0),
        0,
      ),
    [networksState],
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
      const key = String((n as any).accountId ?? (n as any)._id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sortedNetworks]);
  return (
    <div className="tableBase-wrap">
      <table className="tableBase">
        <colgroup>
          {columnsStrategy.map((key) => (
            <col
              key={key}
              style={
                getWidthColumn(proposalsFlag ?? false, false)[key as ColumnKey]
                  ? {
                      width: `${getWidthColumn(proposalsFlag ?? false, false)[key as ColumnKey]}px`,
                    }
                  : undefined
              }
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {columnsStrategy.map((key) => (
              <th key={key} className="tableBase__th">
                <div className="header-content">
                  <span className="th-title">{titles[key]}</span>

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
            {columnsStrategy.map((_, index) => (
              <td
                key={index}
                className={`td--footer ${index === 0 || index === 1 ? "is-left" : ""}`}>
                {index === 0 && <p>Price: {totalPrice}€</p>}
                {index === 1 && <p>{totalFollowers}</p>}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
