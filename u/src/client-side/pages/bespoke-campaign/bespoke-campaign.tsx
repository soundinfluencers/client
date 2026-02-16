import React from "react";
import "./_bespoke-campaign.scss";

import { Breadcrumbs, Container } from "@/components";
import { PromoForm, TabBar } from "@/client-side/widgets";
interface Props {}

export const BespokeCampaign: React.FC<Props> = () => {
  const [tab, setTab] = React.useState<string>("Artist");
  return (
    <Container className="bespoke-campaign">
      <div className="bespoke-campaign__header">
        <Breadcrumbs />
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
