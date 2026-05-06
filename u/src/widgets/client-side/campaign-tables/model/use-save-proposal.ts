import React from "react";
import { toast } from "react-toastify";
import { buildStrategyProposalPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import {postCampaignProposal} from "@/entities/client-side/campaign-strategy-page/api/save-proposal.ts";

type Params = {
    campaignName: string;
    totalPrice: number;
    accounts: any[];
    content: any[];
};

export const useSaveProposal = ({
                                    campaignName,
                                    totalPrice,
                                    accounts,
                                    content,
                                }: Params) => {
    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [socialType, setSocialType] = React.useState("");

    const saveProposal = React.useCallback(async () => {
        try {
            const proposalPayload = buildStrategyProposalPayload({
                campaignName,
                totalPrice,
                accounts,
                content,
            });
        console.log(proposalPayload,'proposal');
            const response = await postCampaignProposal(proposalPayload);

            const payload =
                (response as any)?.data?.data ??
                (response as any)?.data ??
                response;

            const proposalId = String(payload?.campaignId ?? "");
            const socialMedia = String(payload?.socialMedia ?? "");

            if (!proposalId) {
                throw new Error("Proposal id was not returned");
            }

            setCampaignProposalId(proposalId);
            setSocialType(socialMedia);
            setProposalModalOpen(true);

            toast.success("Proposal saved successfully");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to save proposal";

            toast.error(message);
        }
    }, [campaignName, totalPrice, accounts, content]);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
    };
};