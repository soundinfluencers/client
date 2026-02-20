import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

// import type { CampaignPageModel } from "@/pages/client/types";

import { useGroupPromos } from "@/client-side/hooks";

import { Bar } from "@/client-side/ui";
import { TableProposal } from "../campaign-table/table-proposal";

// type ProposelModal = Extract<CampaignPageModel, { kind: "proposal" }>;

interface Props {
  campaign: any;
  changeView: boolean;
  view: number;
}

export const ProposalCampaignPageShare: React.FC<Props> = ({
  campaign,
  changeView,

  view,
}) => {
  const optionIndex = campaign.selectedOption.optionIndex ?? 0;

  console.log(campaign, "campaign");

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(
    campaign.selectedOption.addedAccounts,
  );
  const content = campaign.selectedOption.campaignContent;
  console.log(mainPromos, "mainpromos");
  console.log(content, "conent");

  const byGroup = React.useMemo(
    () => ({
      main: content.filter((x) => x.socialMediaGroup === "main"),
      music: content.filter((x) => x.socialMediaGroup === "music"),
      press: content.filter((x) => x.socialMediaGroup === "press"),
    }),
    [content],
  );

  // const canEditUI = React.useMemo(() => {
  //   return view === -1 && !!campaign.selectedOption.canEdit;
  // }, [view, campaign.selectedOption.canEdit]);

  return (
    <div className="table-page">
      <div className="table-wrapper">
        {byGroup.main.length >= 1 && (
          <TableProposal
            optionIndex={optionIndex}
            totalPrice={campaign.price}
            items={byGroup.main}
            networks={mainPromos}
            group="main"
            canEdit={false}
            changeView={changeView}
          />
        )}

        {byGroup.music.length >= 1 && (
          <TableProposal
            optionIndex={optionIndex}
            canEdit={false}
            totalPrice={campaign.price}
            items={byGroup.music}
            networks={musicPromos}
            group="music"
            changeView={changeView}
          />
        )}

        {byGroup.press.length >= 1 && (
          <TableProposal
            optionIndex={optionIndex}
            canEdit={false}
            totalPrice={campaign.price}
            items={byGroup.press}
            networks={otherPromos}
            group="press"
            changeView={changeView}
          />
        )}
      </div>
    </div>
  );
};
