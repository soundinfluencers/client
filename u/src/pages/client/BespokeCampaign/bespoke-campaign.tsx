import React from "react";

import { TabBar } from "./components/tab-bar";
import "./_bespoke-campaign.scss";
import { PromoForm } from "./tab/promo-form";
import { Breadcrumbs, Container, SaveDraft } from "@/components";
interface Props {}

export const BespokeCampaign: React.FC<Props> = () => {
  const [tab, setTab] = React.useState<string>("Artist");
  return (
    <Container className="bespoke-campaign">
      <div className="bespoke-campaign__header">
        <Breadcrumbs />
        <SaveDraft />
      </div>
      <div className="bespoke-campaign__content">
        <div className="bespoke-campaign__title">
          <h2>Bespoke campaign request</h2>
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
