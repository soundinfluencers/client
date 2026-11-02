import { Breadcrumbs, Container, Loader } from "@/components";
import { ButtonSecondary } from "@/shared/ui";
import styles from "./campaign-post-content.module.scss";
import contentStyles from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.module.scss";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page";
import { useProposalAddInfluencer } from "../model/use-proposal-add-influencer";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

export const ProposalAddInfluencerContentRoute = () => {
    const [params] = useSearchParams();
    const add = useProposalAddInfluencer(params, "/client/create-campaign/content");
    const builder = useCampaignBuilderStore((s) => s);
    const [failedSession, setFailedSession] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (add.ready && !add.error && builder.totalPriceReady && !add.plan.missingGroups.length) setFailedSession(add.finish() ? null : add.session!.sessionId);
    }, [add.ready, add.error, add.plan.missingGroups.length, add.session?.sessionId, builder.totalPriceReady]);
    const recoveryNavigation = <div className={styles.navMenu}><Breadcrumbs/>
        <div className={contentStyles.header}>
            <ButtonSecondary className={contentStyles.secondaryButton} text="Back to selection" onClick={add.backToSelection}/>
            <ButtonSecondary className={contentStyles.secondaryButton} text="Cancel and return to option" onClick={add.cancel}/>
        </div>
    </div>;
    if (add.error) return <Container><p role="alert">{add.error}</p></Container>;
    if (add.ready && (!builder.totalPriceReady || failedSession === add.session?.sessionId)) return <Container>{recoveryNavigation}<div role="alert">
        The selection was not applied. Review its prices and source option before continuing.
    </div></Container>;
    if (!add.ready || !add.plan.missingGroups.length) return <Loader/>;
    const accounts = add.plan.accounts.filter((a) => !a.selectedCampaignContentItem?.campaignContentItemId && !a.addedAccountsId)
        .map((a) => ({ ...a, socialAccountId: a.accountId }));
    return <Container>
        <div className={styles.navMenu}><Breadcrumbs/></div>
        <CampaignPostContentPage key={add.session?.sessionId} mode="add-influencer" submitLabel="Apply to option"
            accounts={accounts} offerAccounts={accounts.filter((a) => a.source === 'offer')} manualAccounts={accounts.filter((a) => a.source !== 'offer')}
            totalPrice={builder.totalPrice} totalPriceReady={builder.totalPriceReady} currency={builder.selectedCurrency}
            defaultCampaignName={builder.campaignName} defaultBlocks={builder.blocksDraft ?? undefined}
            onSubmitPayload={(payload) => { add.finish(payload); }} />
    </Container>;
};
