import React from "react";
import type { CampaignContentItem } from "@/types/store/index.types";

import { NetworkCell } from "../cells/strategy/network-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";

import { ContentCell } from "../cells/strategy/content-cell";

import { DescriptionCell } from "../cells/strategy/description-cell";
import { ExtraFieldsCells } from "../cells/strategy/extra-fields-cells";
import { DescriptionCellEdit } from "../cells/editable-cells/descritpion-edit-cell";
import { ExtraFieldsCellsEdit } from "../cells/editable-cells/extra-edit-cell";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";

import type { TableRowProps } from "@/client-side/types/table-types";
import { ReqData } from "@/client-side/data/table-campaign.data";
import { DateCell } from "../cells/strategy/date-cell";
import { getAccountKey } from "@/client-side/utils";
import { useStrategyCampaignStore } from "@/client-side/store";
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
  campaignId,
}: TableRowProps) {
  console.log(data, "qwe");
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
  const accountKey = getAccountKey(data);
  const setAccountDateRequest = useStrategyCampaignStore(
    (s) => s.setAccountDateRequest,
  );
  const dateRequestRaw = String(data.dateRequest ?? "ASAP");
  const [mode, dateVal = ""] = dateRequestRaw.split(":");
  // const platformItems = React.useMemo(() => {
  //   const key = String(data.socialMedia ?? "")
  //     .trim()
  //     .toLowerCase();
  //   return itemsByPlatform[key] ?? [];
  // }, [itemsByPlatform, data.socialMedia]);

  const selectedItem = platformItems?.[selectedContent];
  const contentId = selectedItem?._id;

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
    <tr className="table-campaign-page__tr">
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
                setAccountDateRequest(campaignId ?? "", accountKey, next);
              } else {
                setAccountDateRequest(campaignId ?? "", accountKey, nextMode);
              }
            }}
            setCustomDate={(nextDate) => {
              const m = mode === "BEFORE" || mode === "AFTER" ? mode : "BEFORE";
              setAccountDateRequest(
                campaignId ?? "",
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
    </tr>
  );
});
