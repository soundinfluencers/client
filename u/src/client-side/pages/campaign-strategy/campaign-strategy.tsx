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
import { toast } from "react-toastify";

interface Props {}

export const CampaignStrategy: React.FC<Props> = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState(true);
  const [campaignIdProposalId, setCampaignProposalId] = React.useState("");
  const [socialType, setSocialType] = React.useState("");
  const { campaignContent, actions, promoCard, campaignName } =
    useCampaignStore();
  console.log(promoCard, "adw");
  const [changeView, setChangeView] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const [saveProposals, setSaveProposals] = React.useState<boolean>(false);
  console.log(campaignContent, "campaignContent");
  const clearPostContentAll = useCampaignStore(
    (s) => s.actions.clearPostContentAll,
  );
  const main = React.useMemo(
    () => campaignContent?.filter((x: any) => x.socialMediaGroup === "main"),
    [campaignContent],
  );

  const music = React.useMemo(
    () => campaignContent?.filter((x: any) => x.socialMediaGroup === "music"),
    [campaignContent],
  );

  const press = React.useMemo(
    () => campaignContent?.filter((x: any) => x.socialMediaGroup === "press"),
    [campaignContent],
  );
  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(promoCard);

  const onSaveDraft = async () => {
    const draftPayload = actions.getDraftPayload();
    console.log(draftPayload, "dra");
    await postCampaignDraft(draftPayload);
    toast.success("Draft saved succesfully!");
    navigate("/client");
    clearPostContentAll();
  };

  const onSaveProposals = async () => {
    setSaveProposals(true);
    const proposalsPayload = actions.getProposalPayload();

    const res = await postCampaignProposal(proposalsPayload);
    console.log(res, "res");
    const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res;
    const proposalId = payload?.campaignId;
    console.log(proposalId, "id");
    setCampaignProposalId(proposalId);
    setSocialType(payload?.socialMedia);
    toast.success("Proposal saved succesfully!");
  };
  const buildPromoShareUrl = (campaignIdProposalId: string) => {
    const origin = "https://test.soundinfluencers.com/"; // https://your-domain.com
    const id = encodeURIComponent(campaignIdProposalId);

    return `${origin}/promo-share/${id}/proposal`;
  };
  const copyPromoShareLink = async (campaignIdProposalId: string) => {
    const url = buildPromoShareUrl(campaignIdProposalId);
    console.log(url, "url");
    console.log(campaignIdProposalId, "campaignIdProposalId");
    console.log(socialType, "socialType");
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.success("Link copied");
    }
  };
  const openCampaignProposal = React.useCallback(
    (id: string) => {
      sessionStorage.setItem(
        "lastCampaign",
        JSON.stringify({
          id,
          status: "proposal",
          optionIndex: 0,
        }),
      );

      navigate("/client/campaign");
    },
    [navigate],
  );
  const shareUrl = React.useMemo(() => {
    if (!campaignIdProposalId) return "";
    return buildPromoShareUrl(campaignIdProposalId);
  }, [campaignIdProposalId]);
  return (
    <>
      <Container className="campaignBase">
        <div className="navmenu">
          <Breadcrumbs />
        </div>{" "}
        <h1>{campaignName || ""} - Campaign SoundInfluencers</h1>
        <Bar campaign={undefined} />
        <div className="contols-strategy">
          {" "}
          {view === 1 && (
            <ViewAudience
              flag={changeView}
              onChange={() => setChangeView((prev) => !prev)}
            />
          )}
          <ViewChange setView={setView} view={view} />
        </div>
        {view === 0 ? (
          <div className="campaignBase__wrapper live-view">
            {main?.length >= 1 &&
              main?.map((item) => (
                <LiveViewCard item={item} networks={mainPromos} />
              ))}
            {music?.length >= 1 &&
              music?.map((item) => (
                <LiveViewCard item={item} networks={musicPromos} />
              ))}
            {press?.length >= 1 &&
              press?.map((item) => (
                <LiveViewCard item={item} networks={otherPromos} />
              ))}
          </div>
        ) : (
          <div className="campaignBase__wrapper">
            {" "}
            {main?.length >= 1 && (
              <TableStrategy
                group="main"
                networks={mainPromos}
                changeView={changeView}
                items={main}
              />
            )}
            {music?.length >= 1 && (
              <TableStrategy
                group="music"
                networks={musicPromos}
                changeView={changeView}
                items={music}
              />
            )}{" "}
            {press?.length >= 1 && (
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
        <Modal
          onClose={() => {
            setSaveProposals(false);
            navigate("/client");
            clearPostContentAll();
          }}>
          <div className="modal-proposal">
            <h2>Proposal saved</h2>
            <input
              type="text"
              value={shareUrl}
              placeholder="https://ffm.to/joan.Linnnnnnnkkkkkkk"
            />
            <div className="modal-proposal-btn">
              <ButtonSecondary
                className="btn"
                text={"Copy share link"}
                onClick={() => copyPromoShareLink(campaignIdProposalId)}
              />
              <ButtonMain
                className="btn"
                text={"Edit proposal"}
                onClick={() => openCampaignProposal(campaignIdProposalId)}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
