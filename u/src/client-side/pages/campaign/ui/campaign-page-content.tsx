import React from "react";
import {
    CampaignTablePage,
    ProposalCampaignPage,
} from "@/client-side/widgets";
import { CampaignTablePageDraft } from "@/client-side/widgets/campaign/table-pages/campaign-page-draft";

type Props = {
    data: any;
    changeView: boolean;
    view: number;
    flag: boolean;
};

export const CampaignPageContent: React.FC<Props> = ({
                                                         data,
                                                         changeView,
                                                         view,
                                                         flag,
                                                     }) => {
    if (data?.kind === "proposal") {
        return (
            <ProposalCampaignPage
                campaign={data}
                changeView={changeView}
                view={view}
            />
        );
    }

    if (data?.kind === "regular") {
        return (
            <CampaignTablePage
                view={view}
                statusFlag={["distributing", "completed"].includes(data.status)}
                campaign={data}
                flag={flag}
            />
        );
    }

    if (data?.kind === "draft") {
        return (
            <CampaignTablePageDraft
                changeView={changeView}
                view={view}
                campaign={data}
            />
        );
    }

    return null;
};