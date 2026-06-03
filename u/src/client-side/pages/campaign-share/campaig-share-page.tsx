import React from "react";
import { Container, Loader } from "@/components";
import "@/client-side/styles-table/_table-campaign.scss";
import "@/client-side/styles-table/campaignBase.scss";

import { useParams } from "react-router-dom";
import { useShareCampaignQuery } from "@/client-side/react-query";
import {
  CampaignTablePageShare,
  ProposalCampaignPageShare,
} from "@/client-side/widgets";
import {
  useFetchCampaign,
  useProposalCampaignStore,
} from "@/client-side/store";
import { OptionsSlider } from "@/client-side/widgets/campaign-share/components/option-slider";
import {
  Bar,
  BarSection,
  ToggleTables,
  ViewAudience,
  ViewChange,
} from "@/client-side/ui";
import {getVisibleCampaignStats} from "@/client-side/pages/campaign-share/model/campaign-campaign.helpers.ts";
interface Props {}

export const CampaignSharePage: React.FC<Props> = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const isProposal = type === "proposal";
  const [activeOption, setActiveOption] = React.useState(0);
  const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>(
    [],
  );
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(1);
  const [flag, setFlag] = React.useState<boolean>(false);
  const loadingProposal = useFetchCampaign((state) => state.isLoading)
  const { data, setProposalOption } = useFetchCampaign();

  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = useShareCampaignQuery(id, {
    enabled: !!id && !isProposal,
  });
  console.log("campaign", campaign);
  React.useEffect(() => {
    if (!id || !isProposal) return;

    const idx = data?.selectedOption?.optionIndex ?? 0;
    useProposalCampaignStore
      .getState()
      .initOption(
        data?.campaignId,
        idx,
        data?.selectedOption?.addedAccounts ?? [],
        data?.selectedOption?.campaignContent ?? [],
        { force: true },
      );
    setProposalOption(id, idx);
    setActiveOption(idx);
  }, [id, isProposal, data?.selectedOption?.optionIndex]);


  const isBarSection =
    campaign && ["distributing", "completed"].includes(campaign?.status);
  const BarComponent = campaign
    ? isBarSection
      ? BarSection
      : Bar
    : data
      ? Bar
      : null;
  // if (isError || !campaign || !data) {
  //   return (
  //     <Container>
  //       <p>Failed to load campaign</p>
  //       <button onClick={() => refetch()}>Retry</button>
  //     </Container>
  //   );
  // }
  const onClickOption = (optionIndex: number) => {
    setActiveOption(optionIndex);
    setProposalOption(data?.campaignId ?? "", optionIndex);
  };
  const optionIndexes =
    type === "proposal"
      ? Array.from(
          new Set([...(data?.existingOptions ?? []), ...localExtraOptions]),
        ).sort((a, b) => a - b)
      : [];
  const statusFlag = ["distributing", "completed"].includes(
    campaign?.status ?? "",
  );
  const barCampaign = campaign || data;

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
  console.log(campaign, "cam");
  if (isLoading || loadingProposal) {
    return <Loader />;
  }
  return (
    <Container className="campaignBase">
      <div className="campaignBase__title">
        <h1>
          {campaign?.campaignName || data?.campaignName} - Campaign
          SoundInfluencers
        </h1>
      </div>{" "}
      {BarComponent && barCampaign && (
          <BarComponent campaign={barCampaign} visibleStats={visibleStats} />
      )}
      {data && (
        <OptionsSlider
          optionIndexes={optionIndexes}
          activeOption={activeOption}
          onClickOption={onClickOption}
        />
      )}{" "}
      <div className="controls-second">
        {" "}
        <div className='controls-second_share-row'>
          {data && flag === true && view !== 0 && (
              <ViewAudience
                  flag={changeView}
                  onChange={() => setChangeView((prev) => !prev)}
              />
          )}{" "}
          {(campaign || data) && (
              <ToggleTables onChange={() => setFlag((prev) => !prev)} flag={flag} />
          )}
        </div>
        <div className="controls-second__content">
          <ViewChange isProposal={false} setView={setView} view={view} />
        </div>
      </div>
      <div className="campaignBase__content">
        <div className="campaignBase__table-wrapper">
          {campaign && (
            <CampaignTablePageShare
              flag={flag}
              statusFlag={statusFlag}
              view={view}
              campaign={campaign}
            />
          )}
          {data && (
              <ProposalCampaignPageShare
                  campaign={data}
                  changeView={changeView}
                  view={view}
                  flag={flag}
              />
          )}
          {data && (
            <p className="option-chose">
              Option {activeOption + 1} is already selected
            </p>
          )}
        </div>
      </div>
    </Container>
  );
};
