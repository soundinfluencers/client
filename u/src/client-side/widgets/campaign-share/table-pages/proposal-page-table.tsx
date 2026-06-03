import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { TableProposal } from "../campaign-table/table-proposal";
import { TableDistributingInsight } from "../campaign-table/table-insight";
import { LiveViewCard } from "../live-view-card/live-view";
import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";

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
    flag: boolean;
}

export const ProposalCampaignPageShare: React.FC<Props> = ({
                                                               campaign,
                                                               changeView,
                                                               view,
                                                               flag,
                                                           }) => {
    const navigate = useNavigate();

    const optionIndex = campaign?.selectedOption?.optionIndex ?? 0;

    const [requestModal, setRequestModal] = React.useState(false);
    const [isRequesting, setIsRequesting] = React.useState(false);

    const [approvedOptions, setApprovedOptions] = React.useState<
        Record<number, boolean>
    >({});

    const [, setRequestSentOptions] = React.useState<Record<number, boolean>>({});

    const [textareaValue, setTextareaValue] = React.useState("");

    const isApproved = Boolean(approvedOptions[optionIndex]);

    const accounts = React.useMemo(
        () => campaign?.selectedOption?.addedAccounts ?? [],
        [campaign?.selectedOption?.addedAccounts],
    );

    const content = React.useMemo(
        () => campaign?.selectedOption?.campaignContent ?? [],
        [campaign?.selectedOption?.campaignContent],
    );

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

    const proceedProposalToPayment = React.useCallback(() => {
        const campaignId = String(campaign?.campaignId ?? "");
        if (!campaignId) return;

        const patches = useUpdateCampaign.getState().patches ?? {};

        useProposalCampaignStore.getState().initOption(
            campaignId,
            optionIndex,
            accounts,
            content,
            { force: true },
        );

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

        sessionStorage.setItem(
            "proposalPaymentPayload",
            JSON.stringify({
                campaignId,
                optionIndex,
                payload: base,
            }),
        );

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
    }, [
        campaign?.campaignId,
        campaign?.campaignName,
        optionIndex,
        accounts,
        content,
        navigate,
    ]);

    const approveOption = React.useCallback(() => {
        setApprovedOptions((prev) => ({
            ...prev,
            [optionIndex]: true,
        }));

        proceedProposalToPayment();
    }, [optionIndex, proceedProposalToPayment]);

    const requestCampaign = React.useCallback(
        async (campaignId: string, text: string) => {
            try {
                setIsRequesting(true);

                await postCampaignRequest(campaignId, text);

                setRequestSentOptions((prev) => ({
                    ...prev,
                    [optionIndex]: true,
                }));

                toast.success("Request Campaign sent successfully!");
            } catch (error) {
                console.error("Failed to request campaign edit", error);
                toast.error("Failed to send request");
            } finally {
                setRequestModal(false);
                setIsRequesting(false);
            }
        },
        [optionIndex],
    );

    const renderStrategyCards = () => (
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
    );

    const renderInsightCards = () => (
        <div className="live-view-wrapper">
            {accounts.map((account: any, index: number) => (
                <LiveViewCardInsight
                    key={
                        account?.addedAccountsId ??
                        account?.socialAccountId ??
                        account?.accountId ??
                        index
                    }
                    campaign={campaign}
                    item={account}
                />
            ))}
        </div>
    );

    const renderStrategyTables = () => (
        <div className="table-wrapper">
            {byGroup.main.length >= 1 && (
                <TableProposal
                    optionIndex={optionIndex}
                    totalPrice={campaign?.isPriceHidden ? null : campaign?.price}
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
                    totalPrice={campaign?.isPriceHidden ? null : campaign?.price}
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
                    totalPrice={campaign?.isPriceHidden ? null : campaign?.price}
                    items={byGroup.press}
                    networks={otherPromos}
                    group="press"
                    title="Press Coverage"
                    canEdit={false}
                    changeView={changeView}
                />
            )}
        </div>
    );

    const renderInsightTable = () => (
        <div className="table-wrapper">
            <TableDistributingInsight campaign={campaign} />
        </div>
    );

    return (
        <div className="table-page">
            {view === 0
                ? flag
                    ? renderStrategyCards()
                    : renderInsightCards()
                : flag
                    ? renderStrategyTables()
                    : renderInsightTable()}

            {!isApproved && (
                <div className="table-page__options">
                    <ButtonMain
                        className="btn"
                        text="Approve"
                        onClick={approveOption}
                    />
                </div>
            )}

            {requestModal && (
                <Modal onClose={() => setRequestModal(false)}>
                    <div className="request-edit">
                        <h2>Request edit</h2>

                        <textarea
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                            placeholder="Enter your edit text"
                        />

                        <ButtonMain
                            className="btn"
                            text={isRequesting ? "Sending..." : "Send"}
                            onClick={() =>
                                requestCampaign(campaign?.campaignId ?? "", textareaValue)
                            }
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};