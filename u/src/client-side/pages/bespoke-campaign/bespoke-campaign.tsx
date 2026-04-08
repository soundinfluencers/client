import React from "react";
import "./_bespoke-campaign.scss";

import { Breadcrumbs, Container } from "@/components";
import { PromoForm, TabBar } from "@/client-side/widgets";
import type {BespokeCampaignTabId} from "./model/bespoke-сampaign.types.ts";


export const BespokeCampaign: React.FC = () => {
    const [tab, setTab] = React.useState<BespokeCampaignTabId>("Artist");

    return (
        <Container className="bespoke-campaign">
            <div className="bespoke-campaign__header">
                <Breadcrumbs />
            </div>

            <div className="bespoke-campaign__content">
                <div className="bespoke-campaign__title">
                    <h2>Agency campaign request</h2>
                    <p>Minimum budget 1000€</p>
                </div>

                <TabBar activeTab={tab} onChange={setTab} />

                <div className="bespoke-campaign__tab-content">
                    <PromoForm activeTabId={tab} />
                </div>
            </div>
        </Container>
    );
};