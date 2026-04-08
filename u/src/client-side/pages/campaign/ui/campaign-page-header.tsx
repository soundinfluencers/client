import React from "react";
import { Breadcrumbs } from "@/components";

type Props = {
    title: string;
    rightSlot?: React.ReactNode;
};

export const CampaignPageHeader: React.FC<Props> = ({ title, rightSlot }) => {
    return (
        <>
            <div className="navmenu">
                <Breadcrumbs />
            </div>

            <div className="campaignBase__title">
                <h1>{title}</h1>
                <div className="campaignBase__title-content">{rightSlot}</div>
            </div>
        </>
    );
};