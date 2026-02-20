import "./_home-page.scss";
import React from "react";
import { Container, ButtonMain, Loader } from "@/components";
import { useUser } from "@/store/get-user";

import type { CampaignStatusType } from "@/types/client/dashboard/campaign.types";

import { useNavigate } from "react-router-dom";
import { useGetCampaignsQuery } from "@/client-side/react-query";
import { BarDashboard, CampaignsList, HomeHeader } from "@/client-side/widgets";
import { useFetchCampaign } from "@/client-side/store";

export type ListDisplayMode = "grid" | "table";
export type CampaignFilterStatus = CampaignStatusType | "all";
export const HomePage = () => {
  const STEP = 12;
  const navigate = useNavigate();
  const { user } = useUser();
  const { setCampaign, setDraft, setProposalOption } = useFetchCampaign();

  const [view, setView] = React.useState<number>(1);
  const [status, setStatus] = React.useState<CampaignFilterStatus>("all");

  const [limit, setLimit] = React.useState(STEP);

  const {
    data: campaigns,
    isError,
    isLoading,
    refetch,
    isFetching,
    isPlaceholderData,
    isSuccess,
  } = useGetCampaignsQuery({ status, limit });

  const campaignsList = Array.isArray(campaigns) ? campaigns : [];
  const hasMore = !isLoading && !isFetching && campaignsList.length === limit;
  // const openCampaign = React.useCallback(
  //   async (id: string, status: CampaignStatusType) => {
  //     switch (status) {
  //       case "draft":
  //         await setDraft(id);
  //         break;

  //       case "proposal":
  //         await setProposalOption(id, 0);
  //         break;

  //       default:
  //         await setCampaign(id);
  //         break;
  //     }

  //     navigate("/client/campaign");
  //   },
  //   [navigate, setCampaign, setDraft, setProposalOption],
  // );
  const openCampaign = React.useCallback(
    (id: string, status: CampaignStatusType) => {
      sessionStorage.setItem(
        "lastCampaign",
        JSON.stringify({ id, status, optionIndex: 0 }),
      );

      navigate("/client/campaign");
    },
    [navigate],
  );

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

      <BarDashboard
        status={status}
        onStatusChange={setStatus}
        view={view}
        setView={setView}
      />

      <CampaignsList
        isLoading={isFetching || isLoading}
        listDisplayMode={view}
        list={campaigns ?? []}
        onOpen={openCampaign}
        onRefresh={refetch}
      />

      {hasMore ? (
        <ButtonMain
          className="button-view-more"
          text={isFetching ? "Loading..." : "View more"}
          onClick={() => setLimit((prev) => prev + 12)}
        />
      ) : (
        <div className="mt"></div>
      )}
    </Container>
  );
};
