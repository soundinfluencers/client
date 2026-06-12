import React from "react";

import link from "@/assets/icons/link (1).svg";
import type { CampaignKind } from "@/entities/client-side/campaign/store/campaign.store";
import { useShareCampaignLink } from "../model/use-share-campaign-link";

import styles from "./share-campaign-link-button.module.scss";

type Props = {
    campaignId?: string;
    socialMedia?: string;
    shareLink?: string;
    kind?: CampaignKind | null;
};

export const ShareCampaignLinkButton: React.FC<Props> = ({
                                                             campaignId,
                                                             socialMedia,
                                                             shareLink,
                                                             kind,
                                                         }) => {
    const { isPending, copyShareLink } = useShareCampaignLink({
        campaignId,
        socialMedia,
        shareLink,
        kind,
    });

    return (
        <div className={styles.shareLinkRowProposal}>
            <button
                type="button"
                onClick={copyShareLink}
                disabled={isPending}
                className={styles.shareLinkProposal}
            >
                <img src={link} alt="" />
                {isPending ? "Copying..." : "Share link"}
            </button>
        </div>
    );
};