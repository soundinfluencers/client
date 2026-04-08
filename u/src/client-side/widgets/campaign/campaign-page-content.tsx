import React from "react";
import {CampaignContentView} from "@/client-side/widgets/campaign/ui/campaign-content-view.tsx";


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
    return (
        <CampaignContentView
            campaign={data}
            changeView={changeView}
            view={view}
            flag={flag}
        />
    );
};