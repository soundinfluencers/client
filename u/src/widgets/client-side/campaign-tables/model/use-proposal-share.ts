import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PROMO_SHARE_ORIGIN = "https://go.soundinfluencers.com";
const CLIENT_CAMPAIGN_ROUTE = "/client/campaign";

export const buildPromoShareUrl = (
    campaignId: string,
    origin: string,
) => {
    const id = encodeURIComponent(campaignId);
    return `${origin}/promo-share/${id}/proposal`;
};

export const useProposalShare = (campaignProposalId: string) => {
    const navigate = useNavigate();

    const shareUrl = React.useMemo(() => {
        if (!campaignProposalId) return "";
        return buildPromoShareUrl(campaignProposalId, PROMO_SHARE_ORIGIN);
    }, [campaignProposalId]);

    const copyShareLink = React.useCallback(async () => {
        if (!campaignProposalId) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied");
        } catch {
            toast.success("Link copied");
        }
    }, [campaignProposalId, shareUrl]);

    const openProposal = React.useCallback(() => {
        if (!campaignProposalId) return;

        sessionStorage.setItem(
            "lastCampaign",
            JSON.stringify({
                id: campaignProposalId,
                status: "proposal",
                optionIndex: 0,
            }),
        );

        navigate(CLIENT_CAMPAIGN_ROUTE);
    }, [campaignProposalId, navigate]);

    return {
        shareUrl,
        copyShareLink,
        openProposal,
    };
};