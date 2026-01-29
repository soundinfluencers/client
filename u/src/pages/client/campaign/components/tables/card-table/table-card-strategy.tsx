import React from "react";
import type { CampaignContentItem } from "@/types/store/index.types";
import type {
  CampaignContentDescription,
  DropdownKey,
  NetworkRowResolved,
  UpdateRowPatch,
} from "../types";
import { NetworkCell } from "../cells/strategy/network-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";
import { ContentCell } from "../cells/strategy/content-cell";
import { DateCell } from "../cells/strategy/date-cell";
import { DescriptionCell } from "../cells/strategy/description-cell";
import { InputCell } from "../cells/strategy/input-cell";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";

type Props = {
  rowId: string;
  data: NetworkRowResolved;
  items: CampaignContentItem[];
  proposalsFlag?: boolean;

  isOpen: (rowId: string, key: DropdownKey) => boolean;
  toggleOpen: (rowId: string, key: DropdownKey) => void;
  closeAny: () => void;

  onUpdateRow: (rowId: string, patch: UpdateRowPatch) => void;

  extraDescriptionsByContentId: Record<string, CampaignContentDescription[]>;
  addDescriptionForContent: (contentId: string, text: string) => string;
};

export const TableCard: React.FC<Props> = (props) => {
  const { data, rowId, onUpdateRow, proposalsFlag } = props;

  const activeContent = data.resolvedContent;

  const overrides = (data as any).contentOverrides ?? {};
  const getValue = (key: string) =>
    (overrides[key] ?? (activeContent as any)?.[key] ?? "") as string;

  const setValue = (key: string, value: string) => {
    onUpdateRow(rowId, { contentOverrides: { [key]: value } as any });
  };

  return (
    <tr className="table-campaign-page__tr">
      <NetworkCell data={data} />
      <FollowersCell data={data} />
      {!proposalsFlag && <DateCell {...props} />}

      {proposalsFlag && <GenresCell data={data} />}
      {proposalsFlag && <CountriesCell data={data} />}
      <ContentCell {...props} />
      <DescriptionCell {...props} />

      {!proposalsFlag && (
        <>
          <InputCell
            value={getValue("taggedUser")}
            onChange={(v) => setValue("taggedUser", v)}
          />
          <InputCell
            value={getValue("taggedLink")}
            onChange={(v) => setValue("taggedLink", v)}
          />
          <InputCell
            value={getValue("additionalBrief")}
            onChange={(v) => setValue("additionalBrief", v)}
            multiline
          />
        </>
      )}
    </tr>
  );
};
