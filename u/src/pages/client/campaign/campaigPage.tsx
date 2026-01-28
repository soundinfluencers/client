import React from "react";
import {
  Breadcrumbs,
  ButtonSecondary,
  Checkbox,
  Container,
  Loader,
} from "@/components";
import { ViewChange } from "../components/table-components/view-change";
import "../scss-campaign-table/campaignBase.scss";
import "../scss-campaign-table/table-base.scss";

import csv from "@/assets/icons/iwwa_file-csv.svg";
import share from "@/assets/icons/mdi-light_share.svg";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import { useFetchCampaign } from "@/store/client/campaign-page";
import link from "@/assets/icons/link (1).svg";
import { CampaignTablePage } from "./components/tables-campaign/table-campaign/campaign-page-table";

import { getShareLink } from "@/api/client/share-link/get-sharelink";
import { AddinitonalOption } from "../components/table-components/additional-options";
import { ViewAudience } from "../components/table-components/view-audience";

export const CampaignPage = () => {
  const [options, setOptions] = React.useState(["Option"]);
  const [activeOption, setActiveOption] = React.useState(0);
  const addOption = () => {
    setOptions((prev) => [...prev, "Option"]);
  };
  const [changeView, setChangeView] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const { campaign, status } = useFetchCampaign();

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const getShareLinkFunction = async (campaignId: string) => {
    try {
      const res = await getShareLink(campaignId);

      const shareLink = res?.data?.shareLink ?? res?.data?.data?.shareLink;

      if (!shareLink) {
        console.error("Share link not found in response", res);
        return;
      }

      await copyToClipboard(shareLink);
    } catch (e) {
      console.error("Failed to copy share link", e);
    }
  };

  if (!campaign) return <Loader />;

  const viewtableProposal = status === "proposal" && changeView;
  console.log(viewtableProposal);
  const statusFlag = ["distributing", "completed"].includes(status || "");
  return (
    <Container className="campaignBase">
      <div className="navmenu">
        <Breadcrumbs />
        <ViewChange setView={setView} view={view} />
      </div>{" "}
      <div className="campaignBase__title">
        {" "}
        <h1>{campaign.campaignName} - Campaign SoundInfluencers</h1>
        {status === "completed" && (
          <ul>
            <li>
              <img src={csv} alt="" />
              CSV File
            </li>
            <li>
              <img src={pdf} alt="" />
              PDF File
            </li>
            <li onClick={() => getShareLinkFunction(campaign.campaignId)}>
              <img src={share} alt="" />
              Share
            </li>
          </ul>
        )}
        {status !== "completed" && (
          <div className="share-link-row">
            <div
              onClick={() => getShareLinkFunction(campaign.campaignId)}
              className="share-link">
              <img src={link} alt="" />
              Copy share link
            </div>
          </div>
        )}
      </div>
      {status && <h3>Status: {status}</h3>}
      <div className="campaignBase__content">
        {" "}
        {status === "proposal" && (
          <ul className="option-list">
            {options.map((option, i) => (
              <li
                className={activeOption === i ? "active-option" : ""}
                onClick={() => setActiveOption(i)}>
                {option} {i + 1}
              </li>
            ))}
          </ul>
        )}
        {status === "proposal" && view === 1 && (
          <div className="controls">
            <AddinitonalOption onClick={addOption} />
            <div className="ViewAudience-block">
              <ViewAudience
                flag={changeView}
                onChange={() => setChangeView((prev) => !prev)}
              />
            </div>
          </div>
        )}
        <CampaignTablePage
          view={view}
          proposalsFlag={viewtableProposal}
          statusFlag={statusFlag}
          campaign={campaign}
        />
      </div>
      <Checkbox name="Allow automatic influencer replacement if a creator opts out." />
      <div className="campaignBase__proceedTo">
        <ButtonSecondary
          text={"Request edit"}
          className="proceedTo"
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
      {/* {saveProposals && (
        <Modal
          title={"Proposal saved"}
          onToggle={() => setSaveProposals(false)}>
          <div className="modal_proposals">
            <input type="text" placeholder="https://wadawddwa" />
            <div className="btn-section-proposals">
              <ButtonSecondary
                text={"Copy share link"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <ButtonMain
                text={"Edit proposal"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        </Modal>
      )} */}
    </Container>
  );
};
