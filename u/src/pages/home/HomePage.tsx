import "./_home-page.scss";
import { getCampaigns } from "@/api/client/dashboard/client-campaign.api";
import { ButtonMain, Container } from "@/components";
import { useUser } from "@/store/get-user";
import { Bar } from "./components/layout/bar/bar";
import { CampaignsList } from "./components/layout/campaigns-list/CampaignsList";
import { HomeHeader } from "./components/layout/header/HomeHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import type { CampaignForList } from "@/types/client/dashboard/campaign.types";
export const HomePage = () => {
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [view, setView] = React.useState<number>(1);
  const {
    data: campaigns,
    isLoading,
    isError,
    refetch,
  } = useQuery<CampaignForList[], Error>({
    queryKey: ["campaigns", "all"],
    queryFn: () => getCampaigns("all"),
  });
  if (isError) return <p>Error loading campaigns</p>;
  return (
    <Container className="home-page">
      <HomeHeader firstName={user?.firstName} />
      <Bar view={view} setView={setView} />
      {isLoading ? (
        "loading.."
      ) : (
        <CampaignsList listDisplayMode={view} list={campaigns ?? []} />
      )}
      <ButtonMain
        className="button-view-more"
        text={"View More"}
        onClick={() => refetch()}
      />
    </Container>
  );
};
