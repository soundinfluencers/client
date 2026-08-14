import React from "react";
import { CampaignContentView } from "@/client-side/widgets/campaign/ui/campaign-content-view.tsx";


type Props = {
  data: any;
  changeView: boolean;
  view: number;
  flag: boolean;
  proposalOptionIndexes: number[];
  onDeleteProposalOption: (optionIndex: number) => Promise<void>;
  isProposalMutationPending: boolean;
};

export const CampaignPageContent: React.FC<Props> = ({
  data,
  changeView,
  view,
  flag,
  proposalOptionIndexes,
  onDeleteProposalOption,
  isProposalMutationPending,
}) => {
  return (
    <CampaignContentView
      campaign={data}
      changeView={changeView}
      view={view}
      flag={flag}
      proposalOptionIndexes={proposalOptionIndexes}
      onDeleteProposalOption={onDeleteProposalOption}
      isProposalMutationPending={isProposalMutationPending}
    />
  );
};
