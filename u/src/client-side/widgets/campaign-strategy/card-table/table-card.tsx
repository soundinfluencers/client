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
  setDropdownsOpen,
  dropdownsOpen,
  changeView,
  group,
  items,
  toggleOpen,
  closeAny,
  isOpen,
}: any) {
  const { actions } = useCampaignStore();

  const [selectedDate, setSelectedDate] = React.useState<string>(ReqData[0]);
  const [customDate, setCustomDate] = React.useState<string>("");

  const [selectedContent, setSelectedContent] = React.useState<number>(0);
  const [selectedPd, setSelectedPd] = React.useState<number>(0);

  const isDateOpen = isOpen(indexCard, "date");
  const isContentOpen = isOpen(indexCard, "content");
  const isPostDescriptionOpen = isOpen(indexCard, "postDescription");

  const platformItems = React.useMemo(
    () => getPlatformItems(items, data.socialMedia),
    [items, data.socialMedia],
  );

  const dateRequest = React.useMemo(() => {
    if (selectedDate === "ASAP") return "ASAP";
    if (!customDate) return selectedDate;
    return `${selectedDate} ${customDate}`;
  }, [selectedDate, customDate]);

  const contentItem = platformItems[selectedContent];

  const payload = React.useMemo(() => {
    return {
      accountId: (data as any).accountId,
      influencerId: (data as any).influencerId,
      socialMedia: (data as any).socialMedia,
      username: (data as any).username,
      selectedCampaignContentItem: {
        campaignContentItemId: contentItem?._id,
        descriptionId: contentItem?.descriptions?.[selectedPd]?._id,
      },
      dateRequest,
    };
  }, [
    data,
    contentItem?._id,
    contentItem?.descriptions,
    selectedPd,
    dateRequest,
  ]);
  const setAccountRef = React.useRef(actions.setCampaignAccount);
  React.useEffect(() => {
    setAccountRef.current = actions.setCampaignAccount;
  }, [actions.setCampaignAccount]);

  React.useEffect(() => {
    setAccountRef.current(payload);
  }, [payload]);

  // const toggle = React.useCallback(
  //   (key: "date" | "content" | "postDescription") => {
  //     setDropdownsOpen((prev) => ({
  //       ...prev,
  //       [indexCard]: {
  //         date: prev[indexCard]?.date ?? false,
  //         content: prev[indexCard]?.content ?? false,
  //         postDescription: prev[indexCard]?.postDescription ?? false,
  //         [key]: !(prev[indexCard]?.[key] ?? false),
  //       },
  //     }));
  //   },
  //   [indexCard, setDropdownsOpen],
  // );

  // const close = React.useCallback(
  //   (key: "date" | "content" | "postDescription") => {
  //     setDropdownsOpen((prev) => ({
  //       ...prev,
  //       [indexCard]: {
  //         date: prev[indexCard]?.date ?? false,
  //         content: prev[indexCard]?.content ?? false,
  //         postDescription: prev[indexCard]?.postDescription ?? false,
  //         [key]: false,
  //       },
  //     }));
  //   },
  //   [indexCard, setDropdownsOpen],
  // );

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

  return (
    <tr>
      <UsernameCell data={data} />
      <FollowersCell data={data} />

      {changeView && <GenresCell data={data} />}
      {changeView && <CountriesCell data={data} />}

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

      <ContentCell
        isOpen={isContentOpen}
        onToggle={onToggleContent}
        onClose={closeAny}
        platformItems={platformItems}
        selectedContent={selectedContent}
        setSelectedContent={setSelectedContent}
        setSelectedPd={setSelectedPd}
        socialMedia={data.socialMedia}
      />

      <DescriptionCell
        isOpen={isPostDescriptionOpen}
        onToggle={onTogglePD}
        onClose={closeAny}
        platformItems={platformItems}
        selectedContent={selectedContent}
        selectedPd={selectedPd}
        setSelectedPd={setSelectedPd}
      />

      <ExtraFieldsCells
        changeView={changeView}
        group={group}
        platformItems={platformItems}
        selectedContent={selectedContent}
      />
    </tr>
  );
});
