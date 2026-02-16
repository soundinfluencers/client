import React from "react";
import type { CampaignContentItem } from "@/types/store/index.types";

import { NetworkCell } from "../cells/strategy/network-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";
import { DateCell } from "../cells/strategy/date-cell";

import { ContentCell } from "../cells/strategy/content-cell";

import { DescriptionCell } from "../cells/strategy/description-cell";
import { ExtraFieldsCells } from "../cells/strategy/extra-fields-cells";
import { DescriptionCellEdit } from "../cells/editable-cells/descritpion-edit-cell";
import { ExtraFieldsCellsEdit } from "../cells/editable-cells/extra-edit-cell";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";
import { ActionCell } from "../cells/action-cells/delete-cell";

import type { TableRowProposalProps } from "@/client-side/types/table-types";
import { ReqData } from "@/client-side/data/table-campaign.data";
import { getAccountKey } from "@/client-side/utils";
import { useProposalAccountsStore } from "@/client-side/store";
const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

export const getGroupBySocial = (
  social: string,
): "main" | "music" | "press" => {
  const s = social.toLowerCase();

  if (MAIN_NETWORKS.includes(s)) return "main";
  if (MUSIC_NETWORKS.includes(s)) return "music";
  return "press";
};
export const TableCard = React.memo(function TableCard({
  data,
  rowKey,
  changeView,
  group,
  items,
  activeDropdown,
  onToggleDropdown,
  canEdit,
  onCloseDropdown,
  optionIndex,
}: TableRowProposalProps) {
  const [selectedContent, setSelectedContent] = React.useState<number>(0);
  const [selectedPd, setSelectedPd] = React.useState<number>(0);

  const isDateOpen =
    activeDropdown?.rowKey === rowKey && activeDropdown.key === "date";
  const isContentOpen =
    activeDropdown?.rowKey === rowKey && activeDropdown.key === "content";
  const isPostDescriptionOpen =
    activeDropdown?.rowKey === rowKey &&
    activeDropdown.key === "postDescription";

  const platformItems = React.useMemo(() => {
    const social = String(data.socialMedia ?? "").toLowerCase();

    const socialItems = (items ?? []).filter(
      (it) => String(it.socialMedia ?? "").toLowerCase() === social,
    );

    if (socialItems.length) return socialItems;

    const group = getGroupBySocial(social);
    const groupItems = (items ?? []).filter(
      (it) => it.socialMediaGroup === group,
    );

    if (social === "instagram") return groupItems;
    if (group === "main") return groupItems.slice(0, 1);

    return groupItems;
  }, [items, data.socialMedia]);

  const selectedItem = platformItems?.[selectedContent];
  const contentId = selectedItem?._id;
  const accountKey = getAccountKey(data);
  const setAccountDateRequest = useProposalAccountsStore(
    (s) => s.setAccountDateRequest,
  );
  const dateRequestRaw = String(data.dateRequest ?? "ASAP");
  const [mode, dateVal = ""] = dateRequestRaw.split(":");
  const toggleDate = React.useCallback(
    () => onToggleDropdown(rowKey, "date"),
    [onToggleDropdown, rowKey],
  );
  const toggleContent = React.useCallback(
    () => onToggleDropdown(rowKey, "content"),
    [onToggleDropdown, rowKey],
  );
  const togglePD = React.useCallback(
    () => onToggleDropdown(rowKey, "postDescription"),
    [onToggleDropdown, rowKey],
  );

  return (
    <tr className={`table-campaign-page__tr ${false ? "row--hl" : ""}`}>
      <NetworkCell data={data} />
      <FollowersCell data={data} />

      {changeView ? (
        <>
          <GenresCell data={data} />
          <CountriesCell data={data} />{" "}
          <ContentCell
            isOpen={isContentOpen}
            onToggle={toggleContent}
            onClose={onCloseDropdown}
            platformItems={platformItems}
            selectedContent={selectedContent}
            setSelectedContent={setSelectedContent}
            setSelectedPd={setSelectedPd}
            socialMedia={data.socialMedia}
          />
          {canEdit ? (
            <DescriptionCellEdit
              isOpen={isPostDescriptionOpen}
              onToggle={togglePD}
              onClose={onCloseDropdown}
              platformItems={platformItems}
              selectedContent={selectedContent}
              selectedPd={selectedPd}
              setSelectedPd={setSelectedPd}
            />
          ) : (
            <DescriptionCell
              isOpen={isPostDescriptionOpen}
              onToggle={togglePD}
              onClose={onCloseDropdown}
              platformItems={platformItems}
              selectedContent={selectedContent}
              selectedPd={selectedPd}
              setSelectedPd={setSelectedPd}
            />
          )}
        </>
      ) : (
        <>
          <DateCell
            isOpen={isDateOpen}
            onToggle={toggleDate}
            onClose={onCloseDropdown}
            selectedDate={mode} // показываем режим
            customDate={dateVal} // показываем дату
            setSelectedDate={(nextMode) => {
              if (nextMode === "BEFORE" || nextMode === "AFTER") {
                const next = dateVal ? `${nextMode}:${dateVal}` : nextMode;
                setAccountDateRequest(optionIndex ?? 0, accountKey, next);
              } else {
                setAccountDateRequest(optionIndex ?? 0, accountKey, nextMode);
              }
            }}
            setCustomDate={(nextDate) => {
              const m = mode === "BEFORE" || mode === "AFTER" ? mode : "BEFORE";
              setAccountDateRequest(
                optionIndex ?? 0,
                accountKey,
                `${m}:${nextDate}`,
              );
            }}
          />

          <ContentCell
            isOpen={isContentOpen}
            onToggle={toggleContent}
            onClose={onCloseDropdown}
            platformItems={platformItems}
            selectedContent={selectedContent}
            setSelectedContent={setSelectedContent}
            setSelectedPd={setSelectedPd}
            socialMedia={data.socialMedia}
          />

          {canEdit ? (
            <DescriptionCellEdit
              isOpen={isPostDescriptionOpen}
              onToggle={togglePD}
              onClose={onCloseDropdown}
              platformItems={platformItems}
              selectedContent={selectedContent}
              selectedPd={selectedPd}
              setSelectedPd={setSelectedPd}
            />
          ) : (
            <DescriptionCell
              isOpen={isPostDescriptionOpen}
              onToggle={togglePD}
              onClose={onCloseDropdown}
              platformItems={platformItems}
              selectedContent={selectedContent}
              selectedPd={selectedPd}
              setSelectedPd={setSelectedPd}
            />
          )}

          {canEdit ? (
            <ExtraFieldsCellsEdit
              contentId={contentId}
              baseItem={selectedItem}
              group={group}
            />
          ) : (
            <ExtraFieldsCells
              group={group}
              platformItems={platformItems}
              selectedContent={selectedContent}
            />
          )}
        </>
      )}

      {canEdit && !changeView && (
        <ActionCell optionIndex={optionIndex ?? 0} data={data} />
      )}
    </tr>
  );
});
