import React from "react";
import { toast } from "react-toastify";
import {
    assertInitialProposalCreateTopology,
    buildStrategyProposalPayload,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import {postCampaignProposal} from "@/entities/client-side/campaign-strategy-page/api/save-proposal.ts";
import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

type Params = {
    campaignName: string;
    totalPrice: number;
    displayCurrency: CampaignCurrencyCode | null;
    accounts: SelectedCampaignAccount[];
    content: CampaignContentItem[];
    selectedOfferId: string | null;
    selectedOfferAccountIds: string[];
};

export const useSaveProposal = ({
    campaignName,
    totalPrice,
    displayCurrency,
    accounts,
    content,
    selectedOfferId,
    selectedOfferAccountIds,
}: Params) => {
    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [socialType, setSocialType] = React.useState("");

    const saveProposal = React.useCallback(async () => {
        try {
            if (!displayCurrency) {
                throw new Error("Proposal currency is missing");
            }

            const proposalPayload = buildStrategyProposalPayload({
                campaignName,
                totalPrice,
                displayCurrency,
                accounts,
                content,
                selectedOfferId,
                selectedOfferAccountIds,
            });
            assertInitialProposalCreateTopology(proposalPayload);
            console.log(proposalPayload, "proposal");
            const created = await postCampaignProposal(proposalPayload);
            const proposalId = String(created.campaignId ?? "");
            const socialMedia = String(proposalPayload.socialMedia ?? "");

            if (
                !proposalId ||
                !Number.isInteger(created.optionIndex) ||
                created.optionIndex < 0
            ) {
                throw new Error("Valid Proposal identity was not returned");
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
    }, [
        campaignName,
        totalPrice,
        displayCurrency,
        accounts,
        content,
        selectedOfferId,
        selectedOfferAccountIds,
    ]);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
    };
};
