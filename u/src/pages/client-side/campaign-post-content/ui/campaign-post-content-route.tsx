import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

import {Breadcrumbs, Container} from "@/components";
import {useNavigate} from "react-router-dom";

export const CampaignPostContentRoute = () => {
    const navigation = useNavigate()
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const selectedOfferName = useCampaignBuilderStore((s) => s.selectedOfferName);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const mappedAccounts = selectedAccounts.map((item) => ({
        accountId: item.accountId,
        influencerId: item.influencerId,
        socialMedia: item.socialMedia,
        username: item.username,
        profileType: item.profileType,
        logoUrl: item.logoUrl,
        followers: item.followers,
        price: item.price,
        dateRequest: item.dateRequest,
        source: item.source,
    }));
    const setCampaignContent = useCampaignBuilderStore((s) => s.actions.setCampaignContent);
    const syncSelectedAccountsContent = useCampaignBuilderStore(

        (s) => s.actions.syncSelectedAccountsContent,

    );
    const offerAccounts = mappedAccounts.filter((item) => item.source === "offer");
    const manualAccounts = mappedAccounts.filter((item) => item.source !== "offer");
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const offerPrice = useCampaignBuilderStore((s) => s.selectedOfferPrice)
    return (
        <Container>
            <div className={styles.navMenu}>
               <Breadcrumbs/>
            </div>

            <CampaignPostContentPage
                defaultCampaignContent={campaignContent}
                accounts={mappedAccounts}
                offerAccounts={offerAccounts}
                manualAccounts={manualAccounts}
                offerName={selectedOfferName}
                totalPrice={totalPrice}
                offerPrice={offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                onSubmitPayload={(payload) => {
                    setCampaignContent(payload.campaignContent);
                    syncSelectedAccountsContent(payload.addedAccounts);

                    navigation("/client/create-campaign/content/strategy");

                }}
            />
        </Container>
    );
};