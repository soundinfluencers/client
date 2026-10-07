import React from "react";
import { ButtonMain, Container, Loader } from "@/components";
import "@/client-side/styles-table/_table-campaign.scss";
import "@/client-side/styles-table/campaignBase.scss";
import styles from "./campaign-share-views.module.scss";

import { useParams } from "react-router-dom";
import { useShareCampaignQuery } from "@/client-side/react-query";
import {
  CampaignTablePageShare,
  ProposalCampaignPageShare,
} from "@/client-side/widgets";
import { useFetchCampaign } from "@/client-side/store";
import { OptionsSlider } from "@/client-side/widgets/campaign-share/components/option-slider";
import {
  Bar,
  BarSection,
  ToggleTables,
  ViewChange,
} from "@/client-side/ui";
import {getVisibleCampaignStats} from "@/client-side/pages/campaign-share/model/campaign-campaign.helpers.ts";
export const CampaignSharePage = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  // Route changes reset the selected option and view before rendering the new flow.
  return <CampaignShareView key={JSON.stringify([id, type])} id={id} type={type} />;
};

const CampaignShareView = ({ id, type }: { id?: string; type?: string }) => {
  const isProposal = type === "proposal";
  const [activeOption, setActiveOption] = React.useState(0);
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(1);
  const [flag, setFlag] = React.useState<boolean>(isProposal);
  const {
    data, dataKey, requestKey,
    isLoading: loadingProposal,
    error: proposalError,
    setProposalOption,
  } = useFetchCampaign();
  const proposalKey = `proposal:${id}:${activeOption}`;
  const isCurrentProposalRequest = requestKey === proposalKey;
  const proposal =
    isProposal && isCurrentProposalRequest && dataKey === proposalKey &&
    data?.kind === "proposal" && String(data.campaignId) === id &&
    data.selectedOption?.optionIndex === activeOption
      ? data
      : undefined;

  const {
    data: regularCampaign,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useShareCampaignQuery(id, {
    enabled: !!id && !isProposal,
  });
  const campaign = isProposal ? undefined : regularCampaign;
  React.useEffect(() => {
    if (!id || !isProposal) return;
    setProposalOption(id, activeOption);
  }, [id, isProposal, activeOption, setProposalOption]);


  const isBarSection =
    campaign && ["distributing", "completed"].includes(campaign?.status);
  const BarComponent = campaign
    ? isBarSection
      ? BarSection
      : Bar
    : proposal
      ? Bar
      : null;
  const onClickOption = (optionIndex: number) => {
    setActiveOption(optionIndex);
  };
  const optionIndexes =
    isProposal
      ? [...(proposal?.existingOptions ?? [])].sort((a, b) => a - b)
      : [];
  const statusFlag = ["distributing", "completed"].includes(
    campaign?.status ?? "",
  );
  const barCampaign = isProposal ? proposal : campaign;
  const fetching = isProposal ? !isCurrentProposalRequest || loadingProposal : isFetching;
  const hasError = isProposal ? isCurrentProposalRequest && Boolean(proposalError) : isError;
  const retry = () => {
    if (isProposal && id) {
      setProposalOption(id, activeOption);
    } else if (!isProposal) {
      refetch();
    }
  };

  const visibleStats = React.useMemo(() => {
    if (!barCampaign) {
      return {
        visibleAccounts: [],
        visibleContent: [],
        postsCount: 0,
        videosCount: 0,
      };
    }

    const accounts =
        type === "proposal"
            ? barCampaign?.selectedOption?.addedAccounts ?? []
            : barCampaign?.addedAccounts ?? [];

    const content =
        type === "proposal"
            ? barCampaign?.selectedOption?.campaignContent ?? []
            : barCampaign?.campaignContent ?? [];

    return getVisibleCampaignStats({
      accounts,
      content,
    });
  }, [barCampaign, type]);
  if (!barCampaign && (isProposal ? fetching : isLoading)) {
    return <Loader />;
  }
  const errorMessage = (hasError || !barCampaign) && (
    <div role="alert">
      <p>{barCampaign
        ? "Unable to refresh campaign. Showing previously loaded data."
        : "Failed to load campaign."}</p>
      <ButtonMain text={fetching ? "Retrying..." : "Retry"} isDisabled={fetching} onClick={retry} />
    </div>
  );
  if (!barCampaign) {
    return <Container className="campaignBase">{errorMessage}</Container>;
  }
  return (
    <Container className="campaignBase">
      {errorMessage}
      <div className="campaignBase__title">
        <h1>
          {barCampaign.campaignName} - Campaign
          SoundInfluencers
        </h1>
      </div>{" "}
      {BarComponent && barCampaign && (
          <BarComponent campaign={barCampaign} visibleStats={visibleStats} />
      )}
      {isProposal && proposal && (
        <OptionsSlider
          optionIndexes={optionIndexes}
          activeOption={activeOption}
          onClickOption={onClickOption}
        />
      )}{" "}
      <div className="controls-second">
        {" "}
        {isProposal ? (
          proposal && (
            <div className={styles.views} role="group" aria-label="Campaign views">
              <button
                type="button"
                className={styles.button}
                aria-pressed={view === 1 && flag && !changeView}
                onClick={() => {
                  setView(1);
                  setFlag(true);
                  setChangeView(false);
                }}>
                Campaign Strategy
              </button>
              <button
                type="button"
                className={styles.button}
                aria-pressed={view === 1 && !flag}
                onClick={() => {
                  setView(1);
                  setFlag(false);
                  setChangeView(false);
                }}>
                Campaign Insights
              </button>
              <button
                type="button"
                className={styles.button}
                aria-pressed={view === 1 && flag && changeView}
                onClick={() => {
                  setView(1);
                  setFlag(true);
                  setChangeView(true);
                }}>
                Advanced Insights
              </button>
            </div>
          )
        ) : (
          <>
            <div className="controls-second_share-row">
              {barCampaign && (
                <ToggleTables onChange={() => setFlag((prev) => !prev)} flag={flag} />
              )}
            </div>
            <div className="controls-second__content">
              <ViewChange isProposal={false} setView={setView} view={view} />
            </div>
          </>
        )}
      </div>
      <div className="campaignBase__content">
        <div className="campaignBase__table-wrapper">
          {!isProposal && campaign && (
            <CampaignTablePageShare
              flag={flag}
              statusFlag={statusFlag}
              view={view}
              campaign={campaign}
            />
          )}
          {isProposal && proposal && (
              <ProposalCampaignPageShare
                  campaign={proposal}
                  changeView={changeView}
                  view={view}
                  flag={flag}
              />
          )}
          {isProposal && proposal && (
            <p className="option-chose">
              Option {activeOption + 1} is already selected
            </p>
          )}
        </div>
      </div>
    </Container>
  );
};
