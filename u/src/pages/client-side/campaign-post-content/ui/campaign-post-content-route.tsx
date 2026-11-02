import { useCreateOptionFromBuilder } from "../model/use-create-option-from-builder";
import React from "react";
import { ProposalAddInfluencerContentRoute } from "./proposal-add-influencer-content-route";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";


import { Breadcrumbs, Container, Loader } from "@/components";
export const CampaignPostContentRoute = () => {
    const [params] = useSearchParams();
    return params.get("mode") === "add-influencer" ? <ProposalAddInfluencerContentRoute /> : <CampaignPostContentDefaultRoute />;
};

export const CampaignPostContentDefaultRoute = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const optionCreate = useCreateOptionFromBuilder(searchParams);
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const selectedOfferName = useCampaignBuilderStore((s) => s.selectedOfferName);
    const selectedOfferAccountIds = useCampaignBuilderStore((s) => s.selectedOfferAccountIds);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const totalPriceReady = useCampaignBuilderStore((s) => s.totalPriceReady);
    const offerPrice = useCampaignBuilderStore((s) => s.selectedOfferPrice);
    const offerAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);

    const setCampaignContent = useCampaignBuilderStore(
        (s) => s.actions.setCampaignContent,
    );
    const syncSelectedAccountsContent = useCampaignBuilderStore(
        (s) => s.actions.syncSelectedAccountsContent,
    );
    const mappedAccounts = React.useMemo(
        () =>
            selectedAccounts.map((item) => ({
                selectionId: item.selectionId,
                selectedCampaignContentItem: item.selectedCampaignContentItem,
                accountId: item.accountId,
                socialAccountId: item.accountId,

                influencerId: item.influencerId,
                socialMedia: item.socialMedia,
                username: item.username,
                profileType: item.profileType,
                logoUrl: item.logoUrl,

                followers: Number(item.followers ?? 0),
                price: item.price,
                publicPrice: item.price,

                dateRequest: item.dateRequest ?? "ASAP",
                source: item.source,
                countries: item.countries,
                genres: item.genres,
            })),
        [selectedAccounts],
    );

    const accountsForPage = mappedAccounts;

    const isOfferRow = (item: typeof accountsForPage[number]) => item.source === "offer" ||
        selectedOfferAccountIds.includes(item.accountId);
    const offerAccounts = accountsForPage.filter(isOfferRow);
    const manualAccounts = accountsForPage.filter((item) => !isOfferRow(item));

    if (optionCreate.invalid) return <p role="alert">Proposal option context is invalid. Reopen the Proposal.</p>;
    if (optionCreate.finalizing) return <Loader/>;
    if (optionCreate.blocked) return <p role="alert">The option may already exist. Reopen the Proposal from the dashboard; do not submit again.</p>;
    if (optionCreate.needsRead) return <div role="alert">{optionCreate.busy && <Loader/>}Option created; reading is incomplete.<button disabled={optionCreate.busy} onClick={() => optionCreate.submit()}>Retry reading option</button></div>;

    return (
        <Container>
            <div className={styles.navMenu}>
                <Breadcrumbs />
            </div>
            {new Set(selectedAccounts.map((a) => a.accountId)).size !== selectedAccounts.length && <div role="alert">
                <p>This draft contains duplicate account selections with potentially different content. Review the rows and explicitly remove unwanted selections before checkout.</p>
                {selectedAccounts.filter((a) => selectedAccounts.filter((b) => b.accountId === a.accountId).length > 1).map((a) =>
                    <p key={a.selectionId}>{a.username} — selection {a.selectionId}, description {a.selectedCampaignContentItem?.descriptionId ?? "none"}
                        <button type="button" onClick={() => useCampaignBuilderStore.getState().actions.removeSelection(a.selectionId!)}>Remove this selection</button>
                    </p>)}
            </div>}

            {optionCreate.enabled && optionCreate.busy && <Loader/>}
            <div inert={optionCreate.busy}><CampaignPostContentPage
                submitLabel={optionCreate.enabled ? "Create option" : undefined}
                mode="create"
                defaultCampaignContent={campaignContent as React.ComponentProps<typeof CampaignPostContentPage>["defaultCampaignContent"]}
                accounts={accountsForPage}
                offerAccounts={offerAccounts}
                manualAccounts={manualAccounts}
                offerName={selectedOfferName}
                offerAvailable={offerAvailable}
                totalPrice={totalPrice}
                totalPriceReady={totalPriceReady}
                offerPrice={offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                currency={selectedCurrency}
                onSubmitPayload={(payload) => {
                    if (optionCreate.enabled) { void optionCreate.submit(payload); return; }
                    setCampaignContent(payload.campaignContent);
                    const current = useCampaignBuilderStore.getState();
                    const remainingRows = payload.addedAccounts.filter((row) => current.selectedAccounts.some((account) =>
                        row.selectionId ? account.selectionId === row.selectionId : account.accountId === row.socialAccountId));
                    syncSelectedAccountsContent(remainingRows);

                    navigate(`/client/create-campaign/content/strategy?currency=${selectedCurrency === "$" ? "USD" : selectedCurrency === "£" ? "GBP" : "EUR"}`);
                }}
            /></div>
        </Container>
    );
};
