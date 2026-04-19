import React from "react";

import { UsernameCell } from "../cells/username-cell";
import { FollowersCell } from "../cells/followers-cell";
import { GenresCell } from "../cells/genres-cell";
import { CountriesCell } from "../cells/countries-cell";
import { DateCell } from "../cells/date-cell";
import { ContentCell } from "../cells/content-cell";
import { DescriptionCell } from "../cells/description-cell";
import { ExtraFieldsCells } from "../cells/extra-fields-cells";
import { ReqData } from "@/client-side/data/table-campaign.data";
import { getPlatformItems } from "@/client-side/utils";
import { useCampaignStore } from "@/client-side/store";

export const TableCard = React.memo(function TableCard({
                                                         data,
                                                         indexCard,
                                                         changeView,
                                                         group,
                                                         items,
                                                         toggleOpen,
                                                         closeAny,
                                                         isOpen,
                                                         columns,
                                                       }: any) {
  const { actions, selectedAccounts } = useCampaignStore();

  const [selectedDate, setSelectedDate] = React.useState<string>(ReqData[0]);
  const [customDate, setCustomDate] = React.useState<string>("");

  const isDateOpen = isOpen(indexCard, "date");
  const isContentOpen = isOpen(indexCard, "content");
  const isPostDescriptionOpen = isOpen(indexCard, "postDescription");

  const platformItems = React.useMemo(
      () => getPlatformItems(items, data.socialMedia),
      [items, data.socialMedia],
  );

  const currentAccount = React.useMemo(() => {
    return selectedAccounts.find(
        (acc) => String(acc.accountId) === String(data.accountId),
    );
  }, [selectedAccounts, data.accountId]);

  const selectedCampaignContentItem =
      currentAccount?.selectedCampaignContentItem ?? null;

  const selectedContent = React.useMemo(() => {
    const contentId = String(
        selectedCampaignContentItem?.campaignContentItemId ?? "",
    );

    if (!contentId) return 0;

    const foundIndex = platformItems.findIndex(
        (item: any) => String(item?._id ?? "") === contentId,
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [platformItems, selectedCampaignContentItem?.campaignContentItemId]);

  const selectedPd = React.useMemo(() => {
    const descriptionId = String(
        selectedCampaignContentItem?.descriptionId ?? "",
    );

    const currentContent = platformItems[selectedContent];
    const descriptions = currentContent?.descriptions ?? [];

    if (!descriptionId) return 0;

    const foundIndex = descriptions.findIndex(
        (desc: any) => String(desc?._id ?? "") === descriptionId,
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [platformItems, selectedContent, selectedCampaignContentItem?.descriptionId]);

  const dateRequest = React.useMemo(() => {
    if (selectedDate === "ASAP") return "ASAP";
    if (!customDate) return selectedDate;
    return `${selectedDate} ${customDate}`;
  }, [selectedDate, customDate]);

  const contentItem = platformItems[selectedContent];

  React.useEffect(() => {
    if (!contentItem?._id) return;

    const descriptionId = String(
        contentItem?.descriptions?.[selectedPd]?._id ?? "",
    );

    actions.setCampaignAccount({
      accountId: String(data.accountId),
      influencerId: String(data.influencerId),
      socialMedia: data.socialMedia,
      username: String(data.username ?? ""),
      selectedCampaignContentItem: {
        campaignContentItemId: String(contentItem._id),
        descriptionId,
      },
      dateRequest,
    });
  }, [
    actions,
    data.accountId,
    data.influencerId,
    data.socialMedia,
    data.username,
    contentItem,
    selectedPd,
    dateRequest,
  ]);

  const onToggleDate = React.useCallback(
      () => toggleOpen(indexCard, "date"),
      [toggleOpen, indexCard],
  );

  const onToggleContent = React.useCallback(
      () => toggleOpen(indexCard, "content"),
      [toggleOpen, indexCard],
  );

  const onTogglePD = React.useCallback(
      () => toggleOpen(indexCard, "postDescription"),
      [toggleOpen, indexCard],
  );

  const handleSelectContent = React.useCallback(
      (nextIndex: number) => {
        const nextItem = platformItems[nextIndex];
        const firstDescriptionId = String(nextItem?.descriptions?.[0]?._id ?? "");

        if (!nextItem?._id) return;

        actions.setSelectedCampaignContentItem(String(data.accountId), {
          campaignContentItemId: String(nextItem._id),
          descriptionId: firstDescriptionId,
        });
      },
      [actions, data.accountId, platformItems],
  );

  const handleSelectPd = React.useCallback(
      (nextPdIndex: number) => {
        const currentItem = platformItems[selectedContent];
        const nextDescription = currentItem?.descriptions?.[nextPdIndex];

        if (!currentItem?._id) return;

        actions.setSelectedCampaignContentItem(String(data.accountId), {
          campaignContentItemId: String(currentItem._id),
          descriptionId: String(nextDescription?._id ?? ""),
        });
      },
      [actions, data.accountId, platformItems, selectedContent],
  );

  return (
      <tr>
        <UsernameCell data={data} />
        {columns.includes("followers") && <FollowersCell data={data} />}

        {!changeView && (
            <DateCell
                isOpen={isDateOpen}
                onToggle={onToggleDate}
                onClose={closeAny}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                customDate={customDate}
                setCustomDate={setCustomDate}
            />
        )}

        {group !== "press" && (
            <ContentCell
                isOpen={isContentOpen}
                onToggle={onToggleContent}
                onClose={closeAny}
                platformItems={platformItems}
                selectedContent={selectedContent}
                setSelectedContent={handleSelectContent}
                setSelectedPd={() => {}}
                socialMedia={data.socialMedia}
                group={group}
            />
        )}

        <DescriptionCell
            isOpen={isPostDescriptionOpen}
            group={group}
            onToggle={onTogglePD}
            onClose={closeAny}
            platformItems={platformItems}
            selectedContent={selectedContent}
            selectedPd={selectedPd}
            setSelectedPd={handleSelectPd}
        />

        <ExtraFieldsCells
            changeView={changeView}
            group={group}
            platformItems={platformItems}
            selectedContent={selectedContent}
        />

          {changeView && columns.includes("genres") && <GenresCell data={data} />}
        {changeView && columns.includes("countries") && (
            <CountriesCell data={data} />
        )}

      </tr>
  );
});