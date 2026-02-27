import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";
import { LiveViewCard } from "../live-view-card/live-view";

// import type { CampaignPageModel } from "@/pages/client/types";
import { useProposalAccountsStore } from "@/client-side/store";
import { useGroupPromos } from "@/client-side/hooks";
import { TableProposal } from "../tables/table-proposal";
import { Bar } from "@/client-side/ui";
import { calcGroupPrices } from "@/client-side/utils";

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
  const { groupPrices } = React.useMemo(
    () => calcGroupPrices(accounts),
    [accounts],
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
    return (view === -1 || view === 2) && !!campaign.selectedOption.canEdit;
  }, [view, campaign.selectedOption.canEdit]);

  return (
    <div className="table-page">
      {/* <Bar campaign={campaign} /> */}

      {view === 2 ? (
        <div className="live-view-wrapper">
          {byGroup.main.length >= 1 &&
            byGroup.main.map((item) => (
              <LiveViewCard
                item={item}
                networks={mainPromos}
                canEdit={campaign?.selectedOption?.canEdit ?? false}
              />
            ))}

          {byGroup.music.length >= 1 &&
            byGroup.music.map((item) => (
              <LiveViewCard
                item={item}
                networks={musicPromos}
                canEdit={campaign?.selectedOption?.canEdit ?? false}
              />
            ))}

          {byGroup.press.length >= 1 &&
            byGroup.press.map((item) => (
              <LiveViewCard
                item={item}
                networks={otherPromos}
                canEdit={campaign?.selectedOption?.canEdit ?? false}
              />
            ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {byGroup.main.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              totalPrice={groupPrices.main}
              items={byGroup.main}
              networks={mainPromos}
              group="main"
              canEdit={canEditUI}
              changeView={changeView}
              title="Video Content Section"
            />
          )}

          {byGroup.music.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              canEdit={canEditUI}
              totalPrice={groupPrices.music}
              items={byGroup.music}
              networks={musicPromos}
              group="music"
              title="Music Section"
              changeView={changeView}
            />
          )}

          {byGroup.press.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              canEdit={canEditUI}
              totalPrice={groupPrices.press}
              items={byGroup.press}
              networks={otherPromos}
              group="press"
              title="Press Section"
              changeView={changeView}
            />
          )}
        </div>
      )}
    </div>
  );
};
