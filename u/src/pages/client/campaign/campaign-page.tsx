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
import link from "@/assets/icons/link (1).svg";

import { useFetchCampaign } from "@/store/client/campaign-page";
import { CampaignTablePage } from "./components/tables/campaign-table/campaign-page-table";
import { AddinitonalOption } from "../components/table-components/additional-options";
import { ViewAudience } from "../components/table-components/view-audience";
import { useCopyShareLinkMutation } from "./hook/use-copy-share-link-mutation";

export const CampaignPage = () => {
  const [options, setOptions] = React.useState(["Option"]);
  const [activeOption, setActiveOption] = React.useState(0);
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(1);

  const { campaign, status } = useFetchCampaign();

  const { mutate: copyShareLink, isPending } = useCopyShareLinkMutation();

  if (!campaign) return <Loader />;

  const viewtableProposal = status === "proposal" && changeView;
  const statusFlag = ["distributing", "completed"].includes(status || "");

  return (
    <Container className="campaignBase">
      <div className="navmenu">
        <Breadcrumbs />
        <ViewChange setView={setView} view={view} />
      </div>

      <div className="campaignBase__title">
        <h1>{campaign.campaignName} - Campaign SoundInfluencers</h1>

        {/* {isPending && <p style={{ marginTop: 8 }}>Copying link...</p>}
        {isError && <p style={{ marginTop: 8 }}>Failed to copy link</p>} */}

        {status === "completed" ? (
          <ul>
            <li>
              <img src={csv} alt="" />
              CSV File
            </li>
            <li>
              <img src={pdf} alt="" />
              PDF File
            </li>
            <li onClick={() => copyShareLink(campaign.campaignId)}>
              <img src={share} alt="" />
              {isPending ? "Copying..." : "Share"}
            </li>
          </ul>
        ) : (
          status !== "proposal" && (
            <div className="share-link-row">
              <div
                onClick={() => copyShareLink(campaign.campaignId)}
                className="share-link">
                <img src={link} alt="" />
                {isPending ? "Copying..." : "Copy share link"}
              </div>
            </div>
          )
        )}
      </div>

      {status && <h3>Status: {status}</h3>}

      <div className="campaignBase__content">
        {status === "proposal" && (
          <ul className="option-list">
            {options.map((option, i) => (
              <li
                key={i}
                className={activeOption === i ? "active-option" : ""}
                onClick={() => setActiveOption(i)}>
                {option} {i + 1}
              </li>
            ))}
          </ul>
        )}

        {status === "proposal" && view === 1 && (
          <div className="controls">
            <AddinitonalOption
              onClick={() => setOptions((p) => [...p, "Option"])}
            />
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
          onClick={() => {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </Container>
  );
};
