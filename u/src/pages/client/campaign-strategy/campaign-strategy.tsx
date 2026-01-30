import React from "react";
import "../scss-campaign-table/campaignBase.scss";

import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonMain,
  ButtonSecondary,
  Checkbox,
  Container,
} from "@/components";
import { ViewChange } from "@/pages/client/components/table-components/view-change";
import { Bar } from "@/pages/client/components/table-components/bar";
import { ViewAudience } from "@/pages/client/components/table-components/view-audience";

import { useCampaignStore } from "@/store/client/create-campaign";

import { TableStrategy } from "./components/table-strategy/strategy-table";

import { LiveViewCard } from "./components/table-strategy/live-view-card/live-view";
import { useGroupPromos } from "@/hooks/client/campaigns/useGroupPromos";
import { postCampaignProposal } from "@/api/client/campaign/campaign.api";
import { postCampaignDraft } from "@/api/client/campaign/draft.api";

interface Props {}

export const CampaignStrategy: React.FC<Props> = () => {
  const navigate = useNavigate();

  const { campaignContent, actions, promoCard, campaignName } =
    useCampaignStore();
  const [changeView, setChangeView] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const [saveProposals, setSaveProposals] = React.useState<boolean>(false);

  const main = React.useMemo(
    () => campaignContent.filter((x: any) => x.socialMediaGroup === "main"),
    [campaignContent],
  );

  const music = React.useMemo(
    () => campaignContent.filter((x: any) => x.socialMediaGroup === "music"),
    [campaignContent],
  );

  const press = React.useMemo(
    () => campaignContent.filter((x: any) => x.socialMediaGroup === "press"),
    [campaignContent],
  );
  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(promoCard);

  const onSaveDraft = async () => {
    const draftPayload = actions.getDraftPayload();

    await postCampaignDraft(draftPayload);
  };
  const onSaveProposals = async () => {
    const proposalsPayload = actions.getProposalPayload("bank_card");

    await postCampaignProposal(proposalsPayload);
  };
  return (
    <Container className="campaignBase">
      <div className="navmenu">
        <Breadcrumbs />
        <ViewChange setView={setView} view={view} />
      </div>{" "}
      <h1>{campaignName || ""} - Campaign SoundInfluencers</h1>
      <Bar />
      {view === 1 && (
        <ViewAudience
          flag={changeView}
          onChange={() => setChangeView((prev) => !prev)}
        />
      )}
      {view === 0 ? (
        <div className="live-view-campaign">
          {main.length >= 1 &&
            main.map((item) => (
              <LiveViewCard item={item} networks={mainPromos} />
            ))}
          {music.length >= 1 &&
            music.map((item) => (
              <LiveViewCard item={item} networks={musicPromos} />
            ))}
          {press.length >= 1 &&
            press.map((item) => (
              <LiveViewCard item={item} networks={otherPromos} />
            ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {" "}
          {main.length >= 1 && (
            <TableStrategy
              group="main"
              networks={mainPromos}
              changeView={changeView}
              items={main}
            />
          )}
          {music.length >= 1 && (
            <TableStrategy
              group="music"
              networks={musicPromos}
              changeView={changeView}
              items={music}
            />
          )}{" "}
          {press.length >= 1 && (
            <TableStrategy
              group="press"
              networks={otherPromos}
              changeView={changeView}
              items={press}
            />
          )}{" "}
        </div>
      )}
      <Checkbox name="Allow automatic influencer replacement if a creator opts out." />
      <div className="campaignBase__options">
        <ButtonSecondary
          text={"Save as proposal"}
          onClick={() => onSaveProposals()}
          className="btn"
        />{" "}
        <ButtonSecondary
          text={"Save Draft"}
          onClick={() => onSaveDraft()}
          className="btn"
        />
      </div>
      <div className="campaignBase__proceedTo">
        <ButtonMain
          text={"Proceed to payment"}
          onClick={() =>
            navigate("/client/CreateCampaign/Content/Strategy/Payment")
          }
          className="proceedTo"
        />
      </div>
    </Container>
  );
};
