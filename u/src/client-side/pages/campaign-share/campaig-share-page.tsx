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
import { useFetchCampaign } from "@/client-side/store";
import { OptionsSlider } from "@/client-side/widgets/campaign-share/components/option-slider";
import { Bar } from "@/client-side/ui";
interface Props {}

export const CampaignSharePage: React.FC<Props> = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const isProposal = type === "proposal";
  const [activeOption, setActiveOption] = React.useState(0);
  const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>(
    [],
  );
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

    // инициализируем proposal с текущей выбранной опцией,
    // а не всегда с 0
    const idx = data?.selectedOption?.optionIndex ?? 0;

    setProposalOption(id, idx);
    setActiveOption(idx);
  }, [id, isProposal]); // ← убрали лишние зависимости
  if (isLoading) {
    return <Loader />;
  }

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

  return (
    <Container className="campaignBase">
      <div className="campaignBase__title">
        <h1>
          {campaign?.campaignName || data?.campaignName} - Campaign
          SoundInfluencers
        </h1>
      </div>
      {data && <Bar campaign={data} />}
      {data && (
        <OptionsSlider
          optionIndexes={optionIndexes}
          activeOption={activeOption}
          onClickOption={onClickOption}
        />
      )}

      <div className="campaignBase__content">
        <div className="campaignBase__table-wrapper">
          {campaign && (
            <CampaignTablePageShare
              statusFlag={statusFlag}
              campaign={campaign}
            />
          )}
          {data && (
            <ProposalCampaignPageShare
              campaign={data}
              changeView={false}
              view={0}
            />
          )}
        </div>
      </div>
    </Container>
  );
};
