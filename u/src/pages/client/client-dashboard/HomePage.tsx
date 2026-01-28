import "./_home-page.scss";
import React from "react";
import { Container, ButtonMain } from "@/components";
import { useUser } from "@/store/get-user";
import { HomeHeader } from "./components/layout/header/HomeHeader";
import { Bar } from "./components/layout/bar/bar";
import { CampaignsList } from "./components/layout/campaigns-list/CampaignsList";

import type { CampaignStatusType } from "@/types/client/dashboard/campaign.types";
import { useFetchCampaign } from "@/store/client/campaign-page/fetch-campaign";
import { useNavigate } from "react-router-dom";
import type { CampaignFilterStatus } from "./types";

import { useGetCampaignsQuery } from "../react-query/useGetCampaigns";

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { setCampaign, setDraft } = useFetchCampaign();

  const [view, setView] = React.useState<number>(1);
  const [status, setStatus] = React.useState<CampaignFilterStatus>("all");

  const [limit, setLimit] = React.useState(12);

  const {
    data: campaigns,
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useGetCampaignsQuery({ status, limit });

  const openCampaign = React.useCallback(
    async (id: string, s: CampaignStatusType) => {
      if (s === "draft") setDraft(id);
      else setCampaign(id);

      navigate("/client/campaign");
    },
    [navigate, setCampaign, setDraft],
  );

  React.useEffect(() => {
    setLimit(12);
  }, [status]);

  if (isError) {
    return (
      <Container className="home-page">
        <HomeHeader balance={user?.balance} firstName={user?.firstName} />
        <div className="home-page__error">
          <p>Error loading campaigns</p>
          <ButtonMain
            text={isFetching ? "Refreshing..." : "Retry"}
            onClick={() => refetch()}
          />
        </div>
      </Container>
    );
  }

  return (
    <Container className="home-page">
      <HomeHeader balance={user?.balance} firstName={user?.firstName} />

      <Bar onStatusChange={setStatus} view={view} setView={setView} />

      {isLoading ? (
        "loading.."
      ) : (
        <CampaignsList
          listDisplayMode={view}
          list={campaigns ?? []}
          onOpen={openCampaign}
          onRefresh={refetch}
        />
      )}

      <ButtonMain
        className="button-view-more"
        text={isFetching ? "Loading..." : "View more"}
        onClick={() => setLimit((prev) => prev + 12)}
      />
    </Container>
  );
};
