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
interface Props {}

export const CampaignSharePage: React.FC<Props> = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const isProposal = type === "proposal";
  const [activeOption, setActiveOption] = React.useState(0);
  const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>(
    [],
  );
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(0);
  const [flag, setFlag] = React.useState<boolean>(true);
  const { data, setProposalOption } = useFetchCampaign();

  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = useShareCampaignQuery(id, {
    enabled: !!id && !isProposal,
  });

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
  if (isLoading) {
    return <Loader />;
  }

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
  console.log(campaign, "cam");
  return (
    <Container className="campaignBase">
      <div className="campaignBase__title">
        <h1>
          {campaign?.campaignName || data?.campaignName} - Campaign
          SoundInfluencers
        </h1>
      </div>{" "}
      {BarComponent && <BarComponent campaign={campaign || data} />}
      {data && (
        <OptionsSlider
          optionIndexes={optionIndexes}
          activeOption={activeOption}
          onClickOption={onClickOption}
        />
      )}{" "}
      <div className="controls-second">
        {" "}
        {data && view !== 0 && (
          <ViewAudience
            flag={changeView}
            onChange={() => setChangeView((prev) => !prev)}
          />
        )}{" "}
        {campaign && campaign.status !== "under_review" && (
          <ToggleTables onChange={() => setFlag((prev) => !prev)} flag={flag} />
        )}
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
