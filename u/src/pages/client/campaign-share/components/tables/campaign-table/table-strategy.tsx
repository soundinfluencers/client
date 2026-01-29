import React from "react";
import "../../../../scss-campaign-table/table-base.scss";
import chevron from "@/assets/icons/chevron-up.svg";

import { columnsStrategy, titles } from "./table-campaign.data";
import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";

import type { DropdownKey, SortDir, UpdateRowPatch } from "../types";

import { useExtraDescriptions } from "@/hooks/client/campaigns/useExtraDescriptions";
import { useResolvedNetworks } from "@/hooks/client/campaigns/useResolvedNetworks";
import { TableCard } from "../card-table/table-card-strategy";

const COL_WIDTH: Partial<Record<string, number>> = {
  network: 185,
  followers: 96,
  date: 113,
  content: 130,
  description: 311,
  taggedUser: 160,
  taggedLink: 220,
  additionalBrief: 260,
  tracklink: 200,
  tracktitle: 200,
};

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number;
};

export function TableStrategy({ items, networks, totalPrice }: Props) {
  const [networksState, setNetworksState] =
    React.useState<CampaignAddedAccount[]>(networks);
  React.useEffect(() => setNetworksState(networks), [networks]);

  const [activeDropdown, setActiveDropdown] = React.useState<{
    rowId: string | null;
    key: DropdownKey | null;
  }>({ rowId: null, key: null });

  const isOpen = React.useCallback(
    (rowId: string, key: DropdownKey) =>
      activeDropdown.rowId === rowId && activeDropdown.key === key,
    [activeDropdown],
  );

  const toggleOpen = React.useCallback((rowId: string, key: DropdownKey) => {
    setActiveDropdown((prev) => {
      const same = prev.rowId === rowId && prev.key === key;
      return same ? { rowId: null, key: null } : { rowId, key };
    });
  }, []);

  const closeAny = React.useCallback(() => {
    setActiveDropdown({ rowId: null, key: null });
  }, []);

  const [followersSort, setFollowersSort] = React.useState<SortDir>(null);
  const toggleFollowersSort = (dir: Exclude<SortDir, null>) => {
    setFollowersSort((prev) => (prev === dir ? null : dir));
  };

  const totalFollowers = React.useMemo(
    () =>
      networksState.reduce(
        (sum, n) => sum + Number((n as any).followers ?? 0),
        0,
      ),
    [networksState],
  );

  const { extraDescriptionsByContentId, addDescriptionForContent } =
    useExtraDescriptions();

  const { resolvedNetworks } = useResolvedNetworks(
    networksState,
    items,
    extraDescriptionsByContentId,
  );

  const sortedNetworks = React.useMemo(() => {
    const arr = [...resolvedNetworks];
    if (!followersSort) return arr;

    arr.sort((a, b) => {
      const af = Number((a as any).followers ?? 0);
      const bf = Number((b as any).followers ?? 0);
      return followersSort === "asc" ? af - bf : bf - af;
    });

    return arr;
  }, [resolvedNetworks, followersSort]);

  const onUpdateRow = React.useCallback(
    (rowId: string, patch: UpdateRowPatch) => {
      setNetworksState((prev) =>
        prev.map((row) => {
          const id = String((row as any).accountId ?? (row as any)._id);
          if (id !== rowId) return row;

          const nextSelectedContent = patch.selectedContent
            ? { ...(row as any).selectedContent, ...patch.selectedContent }
            : (row as any).selectedContent;

          const nextOverrides = patch.contentOverrides
            ? { ...(row as any).contentOverrides, ...patch.contentOverrides }
            : (row as any).contentOverrides;

          return {
            ...row,
            ...(patch.dateRequest ? { dateRequest: patch.dateRequest } : null),
            ...(patch.selectedContent
              ? { selectedContent: nextSelectedContent }
              : null),
            ...(patch.contentOverrides
              ? { contentOverrides: nextOverrides }
              : null),
          } as CampaignAddedAccount;
        }),
      );
    },
    [],
  );

  return (
    <div className="tableBase-wrap">
      <table className="tableBase ">
        <colgroup>
          {columnsStrategy.map((key) => (
            <col
              key={key}
              style={
                COL_WIDTH[key] ? { width: `${COL_WIDTH[key]}px` } : undefined
              }
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {columnsStrategy.map((key) => (
              <th key={key} className="table-campaign-page__th">
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
          {sortedNetworks.map((row) => {
            const rowId = String((row as any).accountId ?? (row as any)._id);

            return (
              <TableCard
                key={rowId}
                rowId={rowId}
                data={row}
                items={items}
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                closeAny={closeAny}
                onUpdateRow={onUpdateRow}
                extraDescriptionsByContentId={extraDescriptionsByContentId}
                addDescriptionForContent={addDescriptionForContent}
              />
            );
          })}
        </tbody>

        <tfoot>
          <tr>
            {columnsStrategy.map((_, index) => (
              <td
                key={index}
                className={`td--footer table-campaign-page__td table-campaign-page__td--footer ${
                  index === 0 || index === 1 ? "is-left" : ""
                }`}>
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
