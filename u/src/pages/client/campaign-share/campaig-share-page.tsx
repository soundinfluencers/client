import React from "react";
import { Container, Loader } from "@/components";
import "../scss-campaign-table/campaignBase.scss";
import "../scss-campaign-table/_table-campaign.scss";

import { CampaignTablePage } from "./components/tables-campaign/table-campaign/campaign-page-table";

import { getShareLink } from "@/api/client/share-link/get-sharelink";
import { useParams } from "react-router-dom";
import type { CampaignResponse } from "@/types/store/index.types";
interface Props {}

export const CampaignSharePage: React.FC<Props> = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = React.useState<CampaignResponse | null>(null);

  const fetchShareCampaign = async () => {
    const { data } = await getShareLink(id ?? "");
    setCampaign(data);
    console.log(data, "atatata");
  };

  React.useEffect(() => {
    fetchShareCampaign();
  }, [id]);

  if (!campaign) return <Loader />;

  const statusFlag = ["distributing", "completed"].includes(status || "");

  return (
    <Container className="campaignBase">
      <div className="campaignBase__title">
        {" "}
        <h1>{campaign.campaignName} - Campaign SoundInfluencers</h1>
      </div>
      <div className="campaignBase__content">
        <div className="campaignBase__table-wrapper">
          {<CampaignTablePage statusFlag={statusFlag} campaign={campaign} />}
        </div>
      </div>
    </Container>
  );
};
