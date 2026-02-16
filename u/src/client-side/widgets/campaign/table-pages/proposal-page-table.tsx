import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";
import { LiveViewCard } from "../live-view-card/live-view";

// import type { CampaignPageModel } from "@/pages/client/types";
import { useProposalAccountsStore } from "@/client-side/store";
import { useGroupPromos } from "@/client-side/hooks";
import { TableProposal } from "../tables/table-proposal";
import { Bar } from "@/client-side/ui";

// type ProposelModal = Extract<CampaignPageModel, { kind: "proposal" }>;

interface Props {
  campaign: any;
  changeView: boolean;
  view: number;
}

export const ProposalCampaignPage: React.FC<Props> = ({
  campaign,
  changeView,

  view,
}) => {
  const optionIndex = campaign.selectedOption.optionIndex ?? 0;

  console.log(campaign, "campaign");

  const initOption = useProposalAccountsStore((s) => s.initOption);

  const storeContent = useProposalAccountsStore(
    (s) => (s as any).contentByOption?.[optionIndex],
  );
  const accounts = useProposalAccountsStore(
    (s) => s.accountsByOption[optionIndex] ?? [],
  );

  React.useEffect(() => {
    initOption(
      optionIndex,
      campaign.selectedOption.addedAccounts,
      campaign.selectedOption.campaignContent,
    );
  }, [
    optionIndex,
    initOption,
    campaign.selectedOption.addedAccounts,
    campaign.selectedOption.campaignContent,
  ]);

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(accounts);
  const content =
    storeContent && storeContent.length
      ? storeContent
      : campaign.selectedOption.campaignContent;
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

  const canEditUI = React.useMemo(() => {
    return view === -1 && !!campaign.selectedOption.canEdit;
  }, [view, campaign.selectedOption.canEdit]);

  return (
    <div className="table-page">
      <Bar campaign={campaign} />

      {view === 1 ? (
        <div className="live-view-wrapper">
          {byGroup.main.length >= 1 &&
            byGroup.main.map((item) => (
              <LiveViewCard item={item} networks={mainPromos} />
            ))}

          {byGroup.music.length >= 1 &&
            byGroup.music.map((item) => (
              <LiveViewCard item={item} networks={musicPromos} />
            ))}

          {byGroup.press.length >= 1 &&
            byGroup.press.map((item) => (
              <LiveViewCard item={item} networks={otherPromos} />
            ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {byGroup.main.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              totalPrice={campaign.price}
              items={byGroup.main}
              networks={mainPromos}
              group="main"
              canEdit={canEditUI}
              changeView={changeView}
            />
          )}

          {byGroup.music.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              canEdit={canEditUI}
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
              canEdit={canEditUI}
              totalPrice={campaign.price}
              items={byGroup.press}
              networks={otherPromos}
              group="press"
              changeView={changeView}
            />
          )}
        </div>
      )}
    </div>
  );
};
