import type { FC } from "react";
import "./_campaigns_list.scss";

import { TableListView } from "./components/table-list-view";
import { GridListView } from "./components/grid-list-view";
import type {
  CampaignForList,
  CampaignStatusType,
} from "@/types/client/dashboard/campaign.types";

export interface CampaignsListProps {
  listDisplayMode: number;
  list: CampaignForList[];
  onOpen: (id: string, status: CampaignStatusType) => Promise<void> | void;
  onRefresh?: () => void;
  isLoading: boolean;
}

const THEAD = ["Status", "Date post", "Name", "Price"] as const;

export const CampaignsList: FC<CampaignsListProps> = ({
  listDisplayMode,
  list,
  onOpen,
  isLoading,
}) => {
  return listDisplayMode === 0 ? (
    <div className="table-wrapper">
      <TableListView
        isLoading={isLoading}
        thead={[...THEAD]}
        list={list}
        onOpen={onOpen}
      />
    </div>
  ) : (
    <GridListView isLoading={isLoading} list={list} onOpen={onOpen} />
  );
};
