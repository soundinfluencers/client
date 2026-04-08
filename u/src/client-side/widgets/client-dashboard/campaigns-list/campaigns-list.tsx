import React, { type FC } from "react";
import "./_campaigns_list.scss";

import { TableListView } from "./components/table-list-view";
import { GridListView } from "./components/grid-list-view";
import type {
  CampaignForList,
  CampaignStatusType,
} from "@/types/client/dashboard/campaign.types";
import type {CampaignListViewMode} from "@/client-side/types/common.ts";
import {NoData} from "@components/ui/no-array/no-data.tsx";



export interface CampaignsListProps {
  listDisplayMode: CampaignListViewMode;
  list: CampaignForList[];
  onOpen: (id: string, status: CampaignStatusType) => Promise<void> | void;
  isLoading: boolean;
}

const THEAD = ["Status", "Date post", "Name", "Price"] as const;

export const CampaignsList: FC<CampaignsListProps> = ({
                                                        listDisplayMode,
                                                        list,
                                                        onOpen,
                                                        isLoading,
                                                      }) => {
    if (!isLoading && list.length === 0) {
        return (
            <NoData>
                <h2>No campaigns right now</h2>
                <p>
                    You can still move forward by using Create a campaign to
                    create a multi <br />-platform promotion tailored to your needs.
                </p>
            </NoData>
        );
    }
  return listDisplayMode === "table" ? (
      <div className="table-wrapper-list">
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