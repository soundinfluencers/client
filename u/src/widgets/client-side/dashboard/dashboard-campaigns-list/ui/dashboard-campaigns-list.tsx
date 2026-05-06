
import styles from "./dashboard-campaigns-list.module.scss";
import type {CampaignViewMode} from "@/features/client-side/dashboard/switch-view/model/types.ts";
import type {CampaignListItem, CampaignStatus} from "@/entities/client-side/dashboard/model/campaign.types.ts";
import { TableListView } from "./table-list-view";
import {GridListView} from './grid-list-view.tsx'
import {NoData} from "@components/ui/no-array/no-data.tsx";

type Props = {
    listDisplayMode: CampaignViewMode;
    list: CampaignListItem[];
    onOpen: (id: string, status: CampaignStatus) => Promise<void> | void;
    isLoading: boolean;
};

const THEAD = ["Status", "Date post", "Name", "Price"] as const;

export const DashboardCampaignsList = ({
                                           listDisplayMode,
                                           list,
                                           onOpen,
                                           isLoading,
                                       }: Props) => {
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
        <div className={styles.tableWrapper}>
            <TableListView isLoading={isLoading} thead={[...THEAD]} list={list} onOpen={onOpen} />
        </div>
    ) : (
        <GridListView isLoading={isLoading} list={list} onOpen={onOpen} />
    );
};