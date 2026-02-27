import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

// import type { CampaignPageModel } from "@/pages/client/types";

import { useGroupPromos } from "@/client-side/hooks";

import { Bar } from "@/client-side/ui";
import { TableProposal } from "../campaign-table/table-proposal";
import { calcGroupPrices } from "@/client-side/utils";
import { LiveViewCard } from "../live-view-card/live-view";
import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";
import { ButtonMain, ButtonSecondary } from "@/components";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { postCampaignRequest } from "@/api/client/campaign/campaign.api";
import { toast } from "react-toastify";
import {
  useProposalCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const optionIndex = campaign.selectedOption.optionIndex ?? 0;
  const [requestModal, setRequestModal] = React.useState(false);
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [approvedOptions, setApprovedOptions] = React.useState<
    Record<number, boolean>
  >({});
  const [requestSentOptions, setRequestSentOptions] = React.useState<
    Record<number, boolean>
  >({});
  const isApproved = !!approvedOptions[optionIndex];
  const isRequestSentOption = !!requestSentOptions[optionIndex];
  const [textaretValue, setTextareaValue] = React.useState("");
  console.log(
    campaign,
    "campaign?.campaignIdcampaign?.campaignIdcampaign?.campaignId",
  );

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(
    campaign.selectedOption.addedAccounts,
  );
  const content = campaign.selectedOption.campaignContent;
  console.log(campaign?.campaignId, "campaign?.campaignId");
  console.log(content, "conent");
  const { groupPrices } = React.useMemo(
    () => calcGroupPrices(campaign?.selectedOption?.addedAccounts),
    [campaign?.selectedOption?.addedAccounts],
  );
  const byGroup = React.useMemo(
    () => ({
      main: content.filter((x) => x.socialMediaGroup === "main"),
      music: content.filter((x) => x.socialMediaGroup === "music"),
      press: content.filter((x) => x.socialMediaGroup === "press"),
    }),
    [content],
  );
  const approveOption = (index: number) => {
    setApprovedOptions((prev) => ({ ...prev, [index]: true }));
    toast.success("Approved!");

    proceedProposalToPayment();
  };
  const requestCampaign = async (campaignId: string, text: string) => {
    try {
      setIsRequesting(true);
      await postCampaignRequest(campaignId, text);

      setRequestSentOptions((prev) => ({
        ...prev,
        [optionIndex]: true,
      }));

      toast.success("Request Campaign sent successfully!");
    } finally {
      setRequestModal(false);
      setIsRequesting(false);
    }
  };
  const proceedProposalToPayment = () => {
    const campaignId = String(campaign?.campaignId ?? "");
    if (!campaignId) return;

    const patches = useUpdateCampaign.getState().patches ?? {};

    const base = useProposalCampaignStore
      .getState()
      .getCampaignPayload(
        campaignId,
        optionIndex,
        campaign?.campaignName ?? "",
        patches,
      );
    console.log(base, "base-proposa");
    useProposalCampaignStore
      .getState()
      .setProposalPayload(campaignId, optionIndex, base);

    navigate(
      `/client/campaign/payment?proposal=${campaignId}&option=${optionIndex}`,
    );
  };

  // const canEditUI = React.useMemo(() => {
  //   return view === -1 && !!campaign.selectedOption.canEdit;
  // }, [view, campaign.selectedOption.canEdit]);

  return (
    <div className="table-page">
      {view === 0 ? (
        <div className="live-view-wrapper">
          <>
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
          </>
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
              canEdit={false}
              changeView={changeView}
            />
          )}

          {byGroup.music.length >= 1 && (
            <TableProposal
              optionIndex={optionIndex}
              canEdit={false}
              totalPrice={groupPrices.music}
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
              totalPrice={groupPrices.press}
              items={byGroup.press}
              networks={otherPromos}
              group="press"
              changeView={changeView}
            />
          )}
        </div>
      )}
      {!isApproved && (
        <div className="table-page__options">
          <ButtonSecondary
            className="btn"
            text={
              isRequestSentOption
                ? "Sent"
                : isRequesting
                  ? "Sending..."
                  : "Request edit"
            }
            onClick={() => setRequestModal(true)}
          />{" "}
          <ButtonMain
            className="btn"
            text="Approve"
            onClick={() => approveOption(optionIndex)}
          />
        </div>
      )}
      {requestModal && (
        <Modal onClose={() => setRequestModal(false)}>
          <div className="request-edit">
            <h2>Request edit</h2>
            <textarea
              value={textaretValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="Enter your edit text"
            />
            <ButtonMain
              className="btn"
              text={"Send"}
              onClick={() =>
                requestCampaign(campaign?.campaignId ?? "", textaretValue)
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
