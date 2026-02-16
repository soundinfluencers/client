import React from "react";
import "@/client-side/styles-table/campaignBase.scss";

import { useNavigate } from "react-router-dom";
import {
  BaseInput,
  Breadcrumbs,
  ButtonMain,
  ButtonSecondary,
  Checkbox,
  Container,
} from "@/components";

import { postCampaignProposal } from "@/api/client/campaign/campaign.api";
import { postCampaignDraft } from "@/api/client/campaign/draft.api";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { LiveViewCard, TableStrategy } from "@/client-side/widgets";
import { Bar, ViewAudience, ViewChange } from "@/client-side/ui";
import { useCampaignStore } from "@/client-side/store";
import { useGroupPromos } from "@/client-side/hooks";

interface Props {}

export const CampaignStrategy: React.FC<Props> = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState(true);

  const { campaignContent, actions, promoCard, campaignName } =
    useCampaignStore();
  const [changeView, setChangeView] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const [saveProposals, setSaveProposals] = React.useState<boolean>(false);
  console.log(campaignContent, "campaignContent");
  const clearPostContentAll = useCampaignStore(
    (s) => s.actions.clearPostContentAll,
  );
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
    clearPostContentAll();
  };

  const onSaveProposals = async () => {
    setSaveProposals(true);
    const proposalsPayload = actions.getProposalPayload();

    await postCampaignProposal(proposalsPayload);
    clearPostContentAll();
  };
  return (
    <>
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
          <div className="campaignBase__wrapper live-view">
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
          <div className="campaignBase__wrapper">
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
        <Checkbox
          name="Allow automatic influencer replacement if a creator opts out."
          isChecked={checked}
          onChange={setChecked}
        />
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
              navigate("/client/create-campaign/content/strategy/payment")
            }
            className="proceedTo"
          />
        </div>
      </Container>
      {saveProposals && (
        <Modal onClose={() => setSaveProposals(false)}>
          <div className="modal-proposal">
            <h2>Proposal saved</h2>
            <input
              type="text"
              placeholder="https://ffm.to/joan.Linnnnnnnkkkkkkk"
            />
            <div className="modal-proposal-btn">
              <ButtonSecondary
                className="btn"
                text={"Copy share link"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <ButtonMain
                className="btn"
                text={"Edit proposal"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
