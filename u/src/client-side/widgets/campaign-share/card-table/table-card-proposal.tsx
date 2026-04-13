import React from "react";
import type { CampaignContentItem } from "@/types/store/index.types";

import { NetworkCell } from "../cells/strategy/network-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";
import { DateCell } from "../cells/strategy/date-cell";
import { ContentCell } from "../cells/strategy/content-cell";
import { DescriptionCell } from "../cells/strategy/description-cell";
import { ExtraFieldsCells } from "../cells/strategy/extra-fields-cells";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";

import type { TableRowProposalProps } from "@/client-side/types/table-types";
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
                                                         columns,
                                                       }: TableRowProposalProps) {
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
        (it: CampaignContentItem) =>
            String(it.socialMedia ?? "").toLowerCase() === social,
    );

    if (socialItems.length) return socialItems;

    const socialGroup = getGroupBySocial(social);
    const groupItems = (items ?? []).filter(
        (it: CampaignContentItem) => it.socialMediaGroup === socialGroup,
    );

    if (social === "instagram") return groupItems;
    if (socialGroup === "main") return groupItems.slice(0, 1);

    return groupItems;
  }, [items, data.socialMedia]);

  const selectedMeta =
      (data as any)?.selectedContent ??
      (data as any)?.selectedCampaignContentItem ??
      null;

  const selectedContentId = String(
      selectedMeta?.campaignContentItemId ?? "",
  );

  const selectedDescriptionId = String(
      selectedMeta?.descriptionId ?? "",
  );

  const resolvedSelectedContent = React.useMemo(() => {
    if (!selectedContentId) return 0;

    const index = platformItems.findIndex(
        (item: any) =>
            String(item?._id ?? item?.id ?? "") === selectedContentId,
    );

    return index >= 0 ? index : 0;
  }, [platformItems, selectedContentId]);

  const resolvedSelectedPd = React.useMemo(() => {
    const descriptions =
        platformItems?.[resolvedSelectedContent]?.descriptions ?? [];

    if (!selectedDescriptionId) return 0;

    const index = descriptions.findIndex(
        (desc: any) => String(desc?._id ?? "") === selectedDescriptionId,
    );

    return index >= 0 ? index : 0;
  }, [platformItems, resolvedSelectedContent, selectedDescriptionId]);

  const [selectedContent, setSelectedContent] = React.useState<number>(
      resolvedSelectedContent,
  );

  const [selectedPd, setSelectedPd] = React.useState<number>(
      resolvedSelectedPd,
  );

  React.useEffect(() => {
    setSelectedContent(resolvedSelectedContent);
  }, [resolvedSelectedContent]);

  React.useEffect(() => {
    setSelectedPd(resolvedSelectedPd);
  }, [resolvedSelectedPd]);

  const safeSelectedContent =
      selectedContent >= 0 && selectedContent < platformItems.length
          ? selectedContent
          : 0;

  const safeSelectedPd = React.useMemo(() => {
    const descriptions =
        platformItems?.[safeSelectedContent]?.descriptions ?? [];

    if (!descriptions.length) return 0;
    if (selectedPd < 0 || selectedPd >= descriptions.length) return 0;

    return selectedPd;
  }, [platformItems, safeSelectedContent, selectedPd]);

  const accountKey = getAccountKey(data);

  const setAccountDateRequest = useProposalAccountsStore(
      (s) => s.setAccountDateRequest,
  );

  const selectedItem = platformItems?.[safeSelectedContent];

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

  const isMarked = useProposalAccountsStore(
      (s) =>
          !!s.recentlyAddedKeysByOption?.[optionIndex ?? 0]?.[
              String(accountKey)
              ],
  );

  return (
      <tr className={`table-campaign-page__tr ${isMarked ? "row--hl" : ""}`}>
        <NetworkCell data={data} />

        {columns.includes("followers") && <FollowersCell data={data} />}

        {changeView ? (
            <>
              {group !== "press" && (
                  <ContentCell
                      isOpen={isContentOpen}
                      onToggle={toggleContent}
                      onClose={onCloseDropdown}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                      setSelectedContent={setSelectedContent}
                      setSelectedPd={setSelectedPd}
                      socialMedia={data.socialMedia}
                      group={group}
                  />
              )}

              {group !== "press" && (
                  <DescriptionCell
                      group={group}
                      isOpen={isPostDescriptionOpen}
                      onToggle={togglePD}
                      onClose={onCloseDropdown}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                      selectedPd={safeSelectedPd}
                      setSelectedPd={setSelectedPd}
                  />
              )}

              {group === "press" && (
                  <ExtraFieldsCells
                      changeView={changeView}
                      group={group}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                  />
              )}
            </>
        ) : (
            <>
              <DateCell
                  canEdit={false}
                  isOpen={isDateOpen}
                  onToggle={toggleDate}
                  onClose={onCloseDropdown}
                  selectedDate={mode}
                  customDate={dateVal}
                  setSelectedDate={(nextMode) => {
                    if (nextMode === "BEFORE" || nextMode === "AFTER") {
                      const next = dateVal ? `${nextMode}:${dateVal}` : nextMode;
                      setAccountDateRequest(optionIndex ?? 0, accountKey, next);
                    } else {
                      setAccountDateRequest(optionIndex ?? 0, accountKey, nextMode);
                    }
                  }}
                  setCustomDate={(nextDate) => {
                    const m =
                        mode === "BEFORE" || mode === "AFTER" ? mode : "BEFORE";
                    setAccountDateRequest(
                        optionIndex ?? 0,
                        accountKey,
                        `${m}:${nextDate}`,
                    );
                  }}
              />

              {group !== "press" && (
                  <ContentCell
                      isOpen={isContentOpen}
                      onToggle={toggleContent}
                      onClose={onCloseDropdown}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                      setSelectedContent={setSelectedContent}
                      setSelectedPd={setSelectedPd}
                      socialMedia={data.socialMedia}
                      group={group}
                  />
              )}

              <DescriptionCell
                  group={group}
                  isOpen={isPostDescriptionOpen}
                  onToggle={togglePD}
                  onClose={onCloseDropdown}
                  platformItems={platformItems}
                  selectedContent={safeSelectedContent}
                  selectedPd={safeSelectedPd}
                  setSelectedPd={setSelectedPd}
              />

              <ExtraFieldsCells
                  changeView={changeView}
                  group={group}
                  platformItems={platformItems}
                  selectedContent={safeSelectedContent}
              />
            </>

        )}

        {columns.includes("genres") && <GenresCell data={data} />}
        {columns.includes("countries") && <CountriesCell data={data} />}
      </tr>
  );
});