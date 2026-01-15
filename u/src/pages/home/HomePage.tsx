import { type FC, useEffect } from "react";
import "./_home-page.scss";
import React from "react";
import { getCampaigns } from "../../api/client/campaign/client-campaign.api";
import { Container } from "../../components";
import { useClientUser } from "../../store/get-user-client";
import { Bar } from "./components/layout/bar/bar";
import { CampaignsList } from "./components/layout/campaigns-list/CampaignsList";
import { HomeHeader } from "./components/layout/header/HomeHeader";

export const HomePage: FC = () => {
  const { user } = useClientUser();
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [view, setView] = React.useState<number>(1);

  const fetch = async () => {
    const data = await getCampaigns();
    console.log(data, "dataaaa");
    setCampaigns(data);
  };
  React.useEffect(() => {
    fetch();
  }, []);
  console.log(campaigns, "campaigns");

  return (
    <Container className="home-page">
      <HomeHeader firstName={user?.firstName} />
      <Bar view={view} setView={setView} />
      {campaigns ? (
        <CampaignsList listDisplayMode={view} list={campaigns} />
      ) : (
        <p>error</p>
      )}
    </Container>
  );
};