import React from "react";
import { Container, Loader } from "@/components";
import "../scss-campaign-table/campaignBase.scss";
import "../scss-campaign-table/_table-campaign.scss";

import { CampaignTablePage } from "./components/tables/campaign-table/campaign-page-table";
import { useParams } from "react-router-dom";
import { useShareCampaignQuery } from "./hooks/use-share-campaign";

interface Props {}

export const CampaignSharePage: React.FC<Props> = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = useShareCampaignQuery(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !campaign) {
    return (
      <Container>
        <p>Failed to load campaign</p>
        <button onClick={() => refetch()}>Retry</button>
      </Container>
    );
  }

  const statusFlag = ["distributing", "completed"].includes(
    campaign.status ?? "",
  );

  return (
    <Container className="campaignBase">
      <div className="campaignBase__title">
        <h1>{campaign.campaignName} - Campaign SoundInfluencers</h1>
      </div>

      <div className="campaignBase__content">
        <div className="campaignBase__table-wrapper">
          <CampaignTablePage statusFlag={statusFlag} campaign={campaign} />
        </div>
      </div>
    </Container>
  );
};
