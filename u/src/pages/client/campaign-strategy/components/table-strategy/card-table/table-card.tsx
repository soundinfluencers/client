import React from "react";
import { useCampaignStore } from "@/store/client/createCampaign";
import { ReqData } from "../table-strategy.data";
import { getPlatformItems } from "../utils/get-platform-items";
import type { TableRowProps } from "../types/table-types";
import { UsernameCell } from "../cells/username-cell";
import { FollowersCell } from "../cells/followers-cell";
import { GenresCell } from "../cells/genres-cell";
import { CountriesCell } from "../cells/countries-cell";
import { DateCell } from "../cells/date-cell";
import { ContentCell } from "../cells/content-cell";
import { DescriptionCell } from "../cells/description-cell";
import { ExtraFieldsCells } from "../cells/extra-fields-cells";

export const TableCard: React.FC<TableRowProps> = ({
  data,
  indexCard,
  setDropdownsOpen,
  dropdownsOpen,
  changeView,
  isMusic,
  items,
  columns,
}) => {
  const { actions } = useCampaignStore();

  const [selectedDate, setSelectedDate] = React.useState<string>(ReqData[0]);
  const [customDate, setCustomDate] = React.useState<string>("");

  const [selectedContent, setSelectedContent] = React.useState<number>(0);
  const [selectedPd, setSelectedPd] = React.useState<number>(0);

  const isDateOpen = dropdownsOpen[indexCard]?.date ?? false;
  const isContentOpen = dropdownsOpen[indexCard]?.content ?? false;
  const isPostDescriptionOpen =
    dropdownsOpen[indexCard]?.postDescription ?? false;

  const dateRequest = React.useMemo(() => {
    if (selectedDate === "ASAP") return "ASAP";
    if (!customDate) return selectedDate;
    return `${selectedDate} ${customDate}`;
  }, [selectedDate, customDate]);

  const platformItems = React.useMemo(
    () => getPlatformItems(items, data.socialMedia),
    [items, data.socialMedia],
  );

  React.useEffect(() => {
    const contentItem = items?.[selectedContent];

    actions.setCampaignAccount({
      accountId: data.accountId,
      influencerId: data.influencerId,
      socialMedia: data.socialMedia,
      username: data.username,
      selectedCampaignContentItem: {
        campaignContentItemId: contentItem?._id,
        descriptionId: contentItem?.descriptions?.[selectedPd]?._id,
      },
      dateRequest,
    });
  }, [
    actions,
    data.accountId,
    data.influencerId,
    data.socialMedia,
    data.username,
    dateRequest,
    items,
    selectedContent,
    selectedPd,
    platformItems,
  ]);

  const toggle = (key: "date" | "content" | "postDescription") => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [indexCard]: {
        date: prev[indexCard]?.date ?? false,
        content: prev[indexCard]?.content ?? false,
        postDescription: prev[indexCard]?.postDescription ?? false,
        [key]: !(prev[indexCard]?.[key] ?? false),
      },
    }));
  };

  const close = (key: "date" | "content" | "postDescription") => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [indexCard]: {
        date: prev[indexCard]?.date ?? false,
        content: prev[indexCard]?.content ?? false,
        postDescription: prev[indexCard]?.postDescription ?? false,
        [key]: false,
      },
    }));
  };

  return (
    <tr>
      <UsernameCell data={data} />
      <FollowersCell data={data} />

      {changeView && <GenresCell data={data} />}
      {changeView && <CountriesCell data={data} />}

      {!changeView && (
        <DateCell
          isOpen={isDateOpen}
          onToggle={() => toggle("date")}
          onClose={() => close("date")}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          customDate={customDate}
          setCustomDate={setCustomDate}
        />
      )}

      <ContentCell
        isOpen={isContentOpen}
        onToggle={() => toggle("content")}
        onClose={() => close("content")}
        platformItems={platformItems}
        selectedContent={selectedContent}
        setSelectedContent={setSelectedContent}
        setSelectedPd={setSelectedPd}
        socialMedia={data.socialMedia}
      />

      <DescriptionCell
        isOpen={isPostDescriptionOpen}
        onToggle={() => toggle("postDescription")}
        onClose={() => close("postDescription")}
        platformItems={platformItems}
        selectedContent={selectedContent}
        selectedPd={selectedPd}
        setSelectedPd={setSelectedPd}
      />

      <ExtraFieldsCells
        changeView={changeView}
        isMusic={isMusic}
        platformItems={platformItems}
        selectedContent={selectedContent}
      />
    </tr>
  );
};
