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
import { DescriptionCellReadonly } from "../cells/strategy/description-cell";
import { TextCell } from "../cells/strategy/text-cell";
import { DateCell } from "../cells/strategy/date-cell";

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
  const { data } = props;

  const activeContent = data.resolvedContent;

  const overrides = (data as any).contentOverrides ?? {};
  const getValue = (key: string) =>
    (overrides[key] ?? (activeContent as any)?.[key] ?? "") as string;

  return (
    <tr className="table-campaign-page__tr">
      <NetworkCell data={data} />
      <FollowersCell data={data} />
      <DateCell {...props} />
      <ContentCell {...props} />
      <DescriptionCellReadonly {...props} />
      <TextCell value={getValue("taggedUser")} />{" "}
      <TextCell value={getValue("taggedLink")} />{" "}
      <TextCell value={getValue("additionalBrief")} />
    </tr>
  );
};
