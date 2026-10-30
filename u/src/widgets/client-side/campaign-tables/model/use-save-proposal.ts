import React from "react";
import { toast } from "react-toastify";
import { buildStrategyProposalPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import {postCampaignProposal} from "@/entities/client-side/campaign-strategy-page/api/save-proposal.ts";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

export const useSaveProposal = () => {
    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [socialType, setSocialType] = React.useState("");

    const saveProposal = React.useCallback(async () => {
        setProposalModalOpen(false);
        try {
            const state = useCampaignBuilderStore.getState();
            if (!state.totalPriceReady) {
                throw new Error("Prices are unavailable for the selected currency. Review the selection before saving the proposal.");
            }
            const proposalPayload = buildStrategyProposalPayload({
                campaignName: state.campaignName,
                totalPrice: state.totalPrice,
                accounts: state.selectedAccounts,
                content: state.campaignContent,
                displayCurrency: state.selectedCurrency,
            });
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
    }, []);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
    };
};
