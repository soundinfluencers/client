import React from "react";
import { toast } from "react-toastify";

import type { CampaignKind } from "@/entities/client-side/campaign/store/campaign.store";
import { buildShareUrl } from "./share-campaign-link.helpers";

type Params = {
    campaignId?: string;
    socialMedia?: string;
    shareLink?: string;
    kind?: CampaignKind | null;
};

export const useShareCampaignLink = ({
                                         campaignId,
                                         socialMedia,
                                         shareLink,
                                         kind,
                                     }: Params) => {
    const [isPending, setIsPending] = React.useState(false);

    const copyShareLink = React.useCallback(async () => {
        if (isPending) return;

        const preparedShareLink = String(shareLink ?? "").trim();

        if (!preparedShareLink && !campaignId) {
            toast.error("Share link data is missing");
            return;
        }

        if (!preparedShareLink && kind !== "proposal" && !socialMedia) {
            toast.error("Share link social media is missing");
            return;
        }

        try {
            setIsPending(true);

            const url =
                preparedShareLink ||
                buildShareUrl({
                    campaignId: String(campaignId),
                    socialMedia,
                    kind,
                });

            await navigator.clipboard.writeText(url);

            toast.success("Shared link copied successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to copy share link");
        } finally {
            setIsPending(false);
        }
    }, [campaignId, socialMedia, shareLink, kind, isPending]);

    return {
        isPending,
        copyShareLink,
    };
};