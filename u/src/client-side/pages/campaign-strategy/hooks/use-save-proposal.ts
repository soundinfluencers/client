import React from "react";
import { toast } from "react-toastify";
import { postCampaignProposal } from "@/api/client/campaign/campaign.api";
import { useCampaignStore } from "@/client-side/store";

export const useSaveProposal = () => {
    const actions = useCampaignStore((state) => state.actions);

    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [socialType, setSocialType] = React.useState("");

    const saveProposal = React.useCallback(async () => {
        const proposalsPayload = actions.getProposalPayload();
        const response = await postCampaignProposal(proposalsPayload);

        const payload =
            (response as any)?.data?.data ??
            (response as any)?.data ??
            response;
        console.log(payload,'proposal-payload-id');
        const proposalId = payload?.campaignId ?? "";
        const socialMedia = payload?.socialMedia ?? "";

        setCampaignProposalId(proposalId);
        setSocialType(socialMedia);
        setProposalModalOpen(true);

        toast.success("Proposal saved successfully!");
    }, [actions]);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
    };
};