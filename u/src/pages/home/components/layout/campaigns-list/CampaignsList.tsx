import type { FC } from "react";
import type { CampaignForList } from "@/pages/client/types/dashboard/campaign.types.ts";
import "./_campaigns_list.scss";
import { TableListView } from "./components/TableListView.tsx";
import { GridListView } from "./components/GridListView.tsx";

export interface CampaignsListProps {
  listDisplayMode: number;
  list: CampaignForList[];
}

export const CampaignsList: FC<CampaignsListProps> = ({
  listDisplayMode,
  list,
}: CampaignsListProps) => {
  if (list?.length === 0) return <div>Empty list</div>;
  const thead = ["Status", "Date post", "Name", "Price"];
  return listDisplayMode === 0 ? (
    <div className="table-wrapper">
      <TableListView thead={thead} list={list} />
    </div>
  ) : (
    <GridListView list={list} />
  );
};
