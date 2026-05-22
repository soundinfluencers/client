import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { TableProposal } from "../campaign-table/table-proposal";
import { LiveViewCard } from "../live-view-card/live-view";
import { ButtonMain } from "@/components";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { postCampaignRequest } from "@/api/client/campaign/campaign.api";
import { toast } from "react-toastify";
import {
  useProposalCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { useNavigate } from "react-router-dom";
import { useGroupPromos } from "@/client-side/hooks";

import {
  buildLiveViewGroups,
  getNetworksForContentItem,
} from "../model/live-view-content.helpers";

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
  const [textaretValue, setTextareaValue] = React.useState("");

  const isApproved = !!approvedOptions[optionIndex];

  const accounts = campaign.selectedOption.addedAccounts ?? [];
  const content = campaign.selectedOption.campaignContent ?? [];

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(accounts);

  const { byGroup, visibleByGroup, accountsByContentId } = React.useMemo(
      () =>
          buildLiveViewGroups({
            content,
            accounts,
          }),
      [content, accounts],
  );

  const getItemNetworks = React.useCallback(
      (item: any) => getNetworksForContentItem(item, accountsByContentId),
      [accountsByContentId],
  );

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

    useProposalCampaignStore
        .getState()
        .setProposalPayload(campaignId, optionIndex, base);

    const paymentPath = `/client/campaign/payment?proposal=${campaignId}&option=${optionIndex}`;

    sessionStorage.setItem(
        "postAuthRedirect",
        JSON.stringify({
          path: paymentPath,
          campaignId,
          optionIndex,
        }),
    );

    navigate(paymentPath);
  };

  const approveOption = (index: number) => {
    setApprovedOptions((prev) => ({ ...prev, [index]: true }));
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

  return (
      <div className="table-page">
        {view === 0 ? (
            <div className="live-view-wrapper">
              {visibleByGroup.main.map((item) => (
                  <LiveViewCard
                      key={item._id}
                      item={item}
                      networks={getItemNetworks(item)}
                  />
              ))}

              {visibleByGroup.music.map((item) => (
                  <LiveViewCard
                      key={item._id}
                      item={item}
                      networks={getItemNetworks(item)}
                  />
              ))}

              {visibleByGroup.press.map((item) => (
                  <LiveViewCard
                      key={item._id}
                      item={item}
                      networks={getItemNetworks(item)}
                  />
              ))}
            </div>
        ) : (
            <div className="table-wrapper">
              {byGroup.main.length >= 1 && (
                  <TableProposal
                      optionIndex={optionIndex}
                      totalPrice={
                        campaign.isPriceHidden ? null : campaign.price
                      }
                      items={byGroup.main}
                      networks={mainPromos}
                      group="main"
                      title="Video Distribution"
                      canEdit={false}
                      changeView={changeView}
                  />
              )}

              {byGroup.music.length >= 1 && (
                  <TableProposal
                      optionIndex={optionIndex}
                      totalPrice={
                        campaign.isPriceHidden ? null : campaign.price
                      }
                      items={byGroup.music}
                      networks={musicPromos}
                      group="music"
                      title="Music Placements"
                      canEdit={false}
                      changeView={changeView}
                  />
              )}

              {byGroup.press.length >= 1 && (
                  <TableProposal
                      optionIndex={optionIndex}
                      totalPrice={
                        campaign.isPriceHidden ? null : campaign.price
                      }
                      items={byGroup.press}
                      networks={otherPromos}
                      group="press"
                      title="Press Coverage"
                      canEdit={false}
                      changeView={changeView}
                  />
              )}
            </div>
        )}

        {!isApproved && (
            <div className="table-page__options">
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
                    text={isRequesting ? "Sending..." : "Send"}
                    onClick={() =>
                        requestCampaign(
                            campaign?.campaignId ?? "",
                            textaretValue,
                        )
                    }
                />
              </div>
            </Modal>
        )}
      </div>
  );
};