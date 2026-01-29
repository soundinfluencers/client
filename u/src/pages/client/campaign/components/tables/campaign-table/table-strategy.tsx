import React from "react";
import "../../../../scss-campaign-table/table-base.scss";

import chevron from "@/assets/icons/chevron-up.svg";

import { useCampaignStore } from "@/store/client/createCampaign";
import {
  columnsStrategy,
  getColumnsStrategy,
  getWidthColumn,
  titles,
} from "./table-campaign.data";
import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";
import plus from "@/assets/icons/plus-square.svg";
import type { DropdownKey, SortDir, UpdateRowPatch } from "../types";

import { TableCard } from "../card-table/table-card-strategy";
import { useFetchCampaign } from "@/store/client/campaign-page";
import { ModalProposalAdd } from "../../proposal-add-module/modal-proposal-add";
import { getUniqueSocialMedias } from "@/utils/functions/getUniqueSocialPlatform";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { useExtraDescriptions } from "@/hooks/client/campaigns/useExtraDescriptions";
import { useResolvedNetworks } from "@/hooks/client/campaigns/useResolvedNetworks";

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number;
  proposalsFlag?: boolean;
};
type ColumnKey = keyof ReturnType<typeof getWidthColumn>;
export function TableStrategy({
  items,
  networks,
  totalPrice,
  proposalsFlag,
}: Props) {
  const { status } = useFetchCampaign();
  const [modal, setModal] = React.useState<boolean>(false);

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

  // ✅ обновление строки
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
  const socialMedias = getUniqueSocialMedias(networks);
  return (
    <div className="tableBase-wrap">
      <table className="tableBase">
        <colgroup>
          {getColumnsStrategy(proposalsFlag ?? false).map((key) => (
            <col
              key={key}
              style={
                getWidthColumn(proposalsFlag ?? false)[key as ColumnKey]
                  ? {
                      width: `${getWidthColumn(proposalsFlag ?? false)[key as ColumnKey]}px`,
                    }
                  : undefined
              }
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {getColumnsStrategy(proposalsFlag ?? false).map((key) => (
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
          {sortedNetworks.map((row) => {
            const rowId = String((row as any).accountId ?? (row as any)._id);

            return (
              <TableCard
                proposalsFlag={proposalsFlag}
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
          {status === "proposal" && (
            <tr>
              <td className="add-influencer-main">
                <div onClick={() => setModal(true)} className="add-influencer">
                  <img src={plus} alt="" />
                  <p>Add Influencer</p>
                </div>
              </td>
            </tr>
          )}
          <tr>
            {getColumnsStrategy(proposalsFlag ?? false).map((_, index) => (
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
      {modal && (
        <ModalProposalAdd
          setModal={() => setModal(false)}
          socialMedias={socialMedias as SocialMediaType[]}
        />
      )}
    </div>
  );
}
