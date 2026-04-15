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

import { ContentCellEdit } from "../cells/editable-cells/content-edit-cell";
import { DescriptionCellEdit } from "../cells/editable-cells/descritpion-edit-cell";
import { ExtraFieldsCellsEdit } from "../cells/editable-cells/extra-edit-cell";

import type { TableRowProposalProps } from "@/client-side/types/table-types";
import { getAccountKey } from "@/client-side/utils";
import { useProposalAccountsStore,useUpdateCampaign } from "@/client-side/store";
import {ActionCell} from "@/client-side/widgets/campaign/cells/action-cells/delete-cell.tsx";

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
  const accountKey = getAccountKey(data);
  const proposalAccount = useProposalAccountsStore((s) => {
    const list = s.accountsByOption[optionIndex ?? 0] ?? [];
    return list.find((item: any) => getAccountKey(item) === String(accountKey));
  });
  const setAccountDateRequest = useProposalAccountsStore(
      (s) => s.setAccountDateRequest,
  );

  const setAccountSelectedContent = useProposalAccountsStore(
      (s: any) => s.setAccountSelectedContent,
  );
    const patches = useUpdateCampaign((s) => s.patches);
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
      (proposalAccount as any)?.selectedContent ??
      (proposalAccount as any)?.selectedCampaignContentItem ??
      (data as any)?.selectedContent ??
      (data as any)?.selectedCampaignContentItem ??
      null;

  const selectedContentId = String(selectedMeta?.campaignContentItemId ?? "");
  const selectedDescriptionId = String(selectedMeta?.descriptionId ?? "");
    const getDescriptionsForItem = React.useCallback(
        (item: any) => {
            const itemId = String(item?._id ?? "");
            if (!itemId) return [];

            return patches[itemId]?.descriptions ?? item?.descriptions ?? [];
        },
        [patches],
    );
  const resolvedSelectedContent = React.useMemo(() => {
    if (!selectedContentId) return 0;

    const index = platformItems.findIndex(
        (item: any) => String(item?._id ?? item?.id ?? "") === selectedContentId,
    );

    return index >= 0 ? index : 0;
  }, [platformItems, selectedContentId]);

    const resolvedSelectedPd = React.useMemo(() => {
        const item = platformItems?.[resolvedSelectedContent];
        const descriptions = getDescriptionsForItem(item);

        if (!selectedDescriptionId) return 0;

        const index = descriptions.findIndex(
            (desc: any) => String(desc?._id ?? "") === selectedDescriptionId,
        );

        return index >= 0 ? index : 0;
    }, [
        platformItems,
        resolvedSelectedContent,
        selectedDescriptionId,
        getDescriptionsForItem,
    ]);

  const [selectedContent, setSelectedContentState] = React.useState<number>(
      resolvedSelectedContent,
  );

  const [pdByContentId, setPdByContentId] = React.useState<Record<string, number>>(
      () => {
        const initialItem = platformItems?.[resolvedSelectedContent];
        const initialContentId = String(initialItem?._id ?? "");
        if (!initialContentId) return {};
        return { [initialContentId]: resolvedSelectedPd };
      },
  );

  React.useEffect(() => {
    setSelectedContentState(resolvedSelectedContent);

    const item = platformItems?.[resolvedSelectedContent];
    const contentId = String(item?._id ?? "");
    if (!contentId) return;

    setPdByContentId((prev) => {
      if (prev[contentId] === resolvedSelectedPd) return prev;
      return {
        ...prev,
        [contentId]: resolvedSelectedPd,
      };
    });
  }, [resolvedSelectedContent, resolvedSelectedPd, platformItems]);

  const safeSelectedContent =
      selectedContent >= 0 && selectedContent < platformItems.length
          ? selectedContent
          : 0;

  const currentContentId = String(
      platformItems?.[safeSelectedContent]?._id ?? "",
  );

  const selectedPd = pdByContentId[currentContentId] ?? 0;

    const safeSelectedPd = React.useMemo(() => {
        const item = platformItems?.[safeSelectedContent];
        const descriptions = getDescriptionsForItem(item);

        if (!descriptions.length) return 0;
        if (selectedPd < 0 || selectedPd >= descriptions.length) return 0;

        return selectedPd;
    }, [platformItems, safeSelectedContent, selectedPd, getDescriptionsForItem]);

  const selectedItem = platformItems?.[safeSelectedContent];
  const contentId = selectedItem?._id;
  const media0 = selectedItem?.mediaCache?.items?.[0];

    const syncSelectedToAccount = React.useCallback(
        (contentIndex: number, pdIndex: number) => {
            const nextItem = platformItems?.[contentIndex];
            const nextDescriptions = getDescriptionsForItem(nextItem);
            const nextDesc = nextDescriptions?.[pdIndex];

            if (!setAccountSelectedContent) return;

            setAccountSelectedContent(optionIndex ?? 0, accountKey, {
                campaignContentItemId: String(nextItem?._id ?? ""),
                descriptionId: String(nextDesc?._id ?? ""),
            });
        },
        [
            platformItems,
            getDescriptionsForItem,
            setAccountSelectedContent,
            optionIndex,
            accountKey,
        ],
    );

  const setSelectedContent = React.useCallback(
      (value: React.SetStateAction<number>) => {
        setSelectedContentState((prevContent) => {
          const nextContent =
              typeof value === "function" ? value(prevContent) : value;

          const nextItem = platformItems?.[nextContent];
          const nextContentId = String(nextItem?._id ?? "");
            const nextDescriptions = getDescriptionsForItem(nextItem);

          const rememberedPd = pdByContentId[nextContentId] ?? 0;
          const resolvedPd =
              nextDescriptions.length && rememberedPd < nextDescriptions.length
                  ? rememberedPd
                  : 0;

          syncSelectedToAccount(nextContent, resolvedPd);

          return nextContent;
        });
      },
      [platformItems, pdByContentId, syncSelectedToAccount],
  );

  const setSelectedPd = React.useCallback(
      (value: React.SetStateAction<number>) => {
        const contentIndex = safeSelectedContent;
        const item = platformItems?.[contentIndex];
        const itemId = String(item?._id ?? "");

        setPdByContentId((prev) => {
          const prevPd = prev[itemId] ?? 0;
          const nextPd =
              typeof value === "function" ? value(prevPd) : value;

          syncSelectedToAccount(contentIndex, nextPd);

          return {
            ...prev,
            [itemId]: nextPd,
          };
        });
      },
      [platformItems, safeSelectedContent, syncSelectedToAccount],
  );

  const handleSelectDescriptionId = React.useCallback(
      (descriptionId: string) => {
        if (!setAccountSelectedContent) return;

        setAccountSelectedContent(optionIndex ?? 0, accountKey, {
          campaignContentItemId: String(selectedItem?._id ?? ""),
          descriptionId: String(descriptionId ?? ""),
        });
      },
      [setAccountSelectedContent, optionIndex, accountKey, selectedItem],
  );

  const dateRequestRaw = String((data as any).dateRequest ?? "ASAP");
  const [mode, dateVal = ""] = dateRequestRaw.split(":");

  const toggleDate = React.useCallback(
      () => onToggleDropdown(rowKey, "date"),
      [onToggleDropdown, rowKey],
  );

  const toggleContent = React.useCallback(
      () => onToggleDropdown(rowKey, "content"),
      [onToggleDropdown, rowKey],
  );
    const isPendingDelete = useProposalAccountsStore(
        (s: any) =>
            !!s.pendingDeleteKeysByOption?.[optionIndex ?? 0]?.[String(accountKey)],
    );
  const togglePD = React.useCallback(
      () => onToggleDropdown(rowKey, "postDescription"),
      [onToggleDropdown, rowKey],
  );

  const isMarked = useProposalAccountsStore(
      (s: any) =>
          !!s.recentlyAddedKeysByOption?.[optionIndex ?? 0]?.[String(accountKey)],
  );

  return (
      <tr
          className={`table-campaign-page__tr ${isMarked ? "row--hl" : ""} ${isPendingDelete ? "row--delete" : ""}`}
      >
        <NetworkCell data={data} />
        {columns.includes("followers") && <FollowersCell data={data} />}

        {changeView ? (
            <>
              {canEdit ? (
                  <ExtraFieldsCellsEdit
                      changeView={changeView}
                      contentId={contentId}
                      baseItem={selectedItem}
                      group={group}
                  />
              ) : (
                  <ExtraFieldsCells
                      changeView={changeView}
                      group={group}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                  />
              )}

              {group !== "press" &&
                  (canEdit ? (
                      <ContentCellEdit
                          optionIndex={optionIndex ?? 0}
                          accountKey={accountKey}
                          selectedItem={selectedItem}
                          group={group}
                          media0={media0}
                          isOpen={isContentOpen}
                          onToggle={toggleContent}
                          onClose={onCloseDropdown}
                          platformItems={platformItems}
                          selectedContent={safeSelectedContent}
                          setSelectedContent={setSelectedContent}
                          setSelectedPd={setSelectedPd}
                          socialMedia={data.socialMedia}
                      />
                  ) : (
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
                          media0={media0}
                      />
                  ))}

              {group !== "press" &&
                  (canEdit ? (
                      <DescriptionCellEdit
                          onSelectDescriptionId={handleSelectDescriptionId}
                          group={group}
                          isOpen={isPostDescriptionOpen}
                          onToggle={togglePD}
                          onClose={onCloseDropdown}
                          platformItems={platformItems}
                          selectedContent={safeSelectedContent}
                          selectedPd={safeSelectedPd}
                          setSelectedPd={setSelectedPd}
                      />
                  ) : (
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
                  ))}

              {group === "press" && !canEdit && (
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
                    const m = mode === "BEFORE" || mode === "AFTER" ? mode : "BEFORE";
                    setAccountDateRequest(
                        optionIndex ?? 0,
                        accountKey,
                        `${m}:${nextDate}`,
                    );
                  }}
              />

              {group !== "press" &&
                  (canEdit ? (
                      <ContentCellEdit
                          optionIndex={optionIndex ?? 0}
                          accountKey={accountKey}
                          selectedItem={selectedItem}
                          group={group}
                          media0={media0}
                          isOpen={isContentOpen}
                          onToggle={toggleContent}
                          onClose={onCloseDropdown}
                          platformItems={platformItems}
                          selectedContent={safeSelectedContent}
                          setSelectedContent={setSelectedContent}
                          setSelectedPd={setSelectedPd}
                          socialMedia={data.socialMedia}
                      />
                  ) : (
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
                          media0={media0}
                      />
                  ))}

              {canEdit ? (
                  <DescriptionCellEdit
                      onSelectDescriptionId={handleSelectDescriptionId}
                      group={group}
                      isOpen={isPostDescriptionOpen}
                      onToggle={togglePD}
                      onClose={onCloseDropdown}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                      selectedPd={safeSelectedPd}
                      setSelectedPd={setSelectedPd}
                  />
              ) : (
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

              {canEdit ? (
                  <ExtraFieldsCellsEdit
                      contentId={contentId}
                      baseItem={selectedItem}
                      group={group}
                  />
              ) : (
                  <ExtraFieldsCells
                      changeView={changeView}
                      group={group}
                      platformItems={platformItems}
                      selectedContent={safeSelectedContent}
                  />
              )}
            </>
        )}

        {columns.includes("genres") && <GenresCell data={data} />}
        {columns.includes("countries") && <CountriesCell data={data} />}
        {canEdit && !changeView && (
            <ActionCell optionIndex={optionIndex ?? 0} data={data} />
        )}
      </tr>
  );
});