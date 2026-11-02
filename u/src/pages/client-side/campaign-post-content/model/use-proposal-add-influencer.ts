import React from "react";
import { ObjectId } from "bson";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProposalCampaign } from "@/api/client/campaign/campaign.api";
import { getPublishedOffers } from "@/entities/client-side/campaign-creator-page/offer/api/offer.api";
import { searchPromoAccounts } from "@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.api";
import { useFetchCampaign, useProposalAccountsStore, useUpdateCampaign } from "@/client-side/store";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { serializeCampaignContent } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import { currencyCode } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { assertProposalAddSource, buildProposalAddWorkingResult, effectiveProposalOffer, initializeProposalAddContent,
    prepareProposalAddInfluencerBuilder, proposalAddContext, proposalWorkingFingerprint } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder";

export const useProposalAddInfluencer = (params: URLSearchParams, path = "/client/create-campaign") => {
    const navigate = useNavigate();
    let parsed: ReturnType<typeof proposalAddContext> = null, invalid = "";
    try { parsed = proposalAddContext(params); } catch (e) { invalid = (e as Error).message; }
    const requested = params.get("mode") === "add-influencer";
    const key = `${parsed?.campaignId}:${parsed?.optionIndex}:${parsed?.sessionId}`;
    const latestKey = React.useRef(key); latestKey.current = key;
    const mounted = React.useRef(false), applying = React.useRef(false);
    const token = React.useMemo(() => parsed?.sessionId || new ObjectId().toHexString(), [key]);
    const [readyKey, setReadyKey] = React.useState("");
    const [failure, setFailure] = React.useState<{ key: string; message: string } | null>(null);
    const setError = (message: string) => setFailure(message ? { key, message } : null);
    const error = failure?.key === key ? failure.message : "";
    const builder = useCampaignBuilderStore((s) => s);
    React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    React.useEffect(() => {
        if (!parsed) return;
        let cancelled = false;
        const live = () => !cancelled && mounted.current && latestKey.current === key;
        setReadyKey(""); setError("");
        const prepare = async () => {
            let cache = useProposalAccountsStore.getState();
            const sourceKey = `proposal:${parsed.campaignId}:${parsed.optionIndex}`;
            const session = useCampaignBuilderStore.getState().proposalAddSession;
            if (session && session.sessionId === token && session.campaignId === parsed.campaignId && session.optionIndex === parsed.optionIndex) {
                if (session.completed) throw new Error("This Add Influencer session is complete. Open the Proposal to start another session.");
                if (cache.currentCampaignId !== parsed.campaignId || proposalWorkingFingerprint(cache, parsed.optionIndex) !== session.baseline ||
                    useFetchCampaign.getState().requestKey !== session.requestKey || useFetchCampaign.getState().requestVersion !== session.requestVersion) throw new Error("The source option changed. Reopen Add Influencer from the Proposal.");
                if (live()) setReadyKey(key);
                return;
            }
            if (cache.currentCampaignId && cache.currentCampaignId !== parsed.campaignId && Object.keys(cache.accountsByOption).length) throw new Error("Open the requested Proposal before using Add Influencer. Another campaign has cached edits.");
            if (cache.currentCampaignId === parsed.campaignId && cache.optionSnapshotsByIndex[parsed.optionIndex] && useFetchCampaign.getState().requestKey !== sourceKey) throw new Error("The active option changed before Add Influencer opened. Reopen it from the requested source option.");
            const patches = useUpdateCampaign.getState().patches;
            if (Object.keys(patches).length) {
                if (cache.currentCampaignId !== parsed.campaignId || useFetchCampaign.getState().requestKey !== sourceKey || !cache.contentByOption[parsed.optionIndex]) throw new Error("Return to the source editor to review its unsaved content.");
                const content = cache.contentByOption[parsed.optionIndex];
                if (Object.keys(patches).some((id) => !content.some((c) => c._id === id))) throw new Error("Unmatched editor patches must be reviewed before continuing.");
                useProposalAccountsStore.setState({ contentByOption: { ...cache.contentByOption, [parsed.optionIndex]: serializeCampaignContent(content.map((c) => ({ ...c, ...(patches[c._id] ?? {}) }))) } });
                useUpdateCampaign.getState().reset(); cache = useProposalAccountsStore.getState();
            }
            let version = useFetchCampaign.getState().requestVersion, ownerKey = useFetchCampaign.getState().requestKey;
            let parent: any;
            const hasSource = cache.currentCampaignId === parsed.campaignId && cache.optionSnapshotsByIndex[parsed.optionIndex];
            if (hasSource) {
                const response = await getProposalCampaign(parsed.campaignId, parsed.optionIndex);
                parent = response.data?.data ?? response.data;
            } else {
                const promise = useFetchCampaign.getState().setProposalOption(parsed.campaignId, parsed.optionIndex, live);
                version = useFetchCampaign.getState().requestVersion; ownerKey = sourceKey;
                parent = await promise;
            }
            const owns = () => live() && useFetchCampaign.getState().requestKey === ownerKey && useFetchCampaign.getState().requestVersion === version;
            if (!owns()) { if (live()) setError("The source reader changed. Reopen Add Influencer from the Proposal."); return; }
            if (parent?.campaignId !== parsed.campaignId || parent?.selectedOption?.optionIndex !== parsed.optionIndex || parent.selectedOption.canEdit !== true) throw new Error("This Proposal option is unavailable for editing.");
            if (!hasSource) {
                assertProposalAddSource(parent.selectedOption, parent.selectedOption.addedAccounts);
                cache.setCurrentCampaignId(parsed.campaignId);
                cache.initOption(parsed.optionIndex, parent.selectedOption.addedAccounts, parent.selectedOption.campaignContent, { force: true, snapshot: parent.selectedOption });
                cache = useProposalAccountsStore.getState();
            }
            const baseline = proposalWorkingFingerprint(cache, parsed.optionIndex);
            const snapshot = cache.optionSnapshotsByIndex[parsed.optionIndex], rows: any[] = cache.accountsByOption[parsed.optionIndex] ?? [];
            assertProposalAddSource(snapshot, rows);
            const offer = effectiveProposalOffer(cache, parsed.optionIndex), currency = snapshot.displayCurrency;
            const preview = cache.offerPreviewByOption[parsed.optionIndex] ?? (snapshot.selectedOffer?.offerId === offer?.offerId ? snapshot.selectedOffer : null);
            const accounts = new Map<string, any>();
            let offerMetadata = preview;
            const jobs: Promise<void>[] = rows.filter((a) => !offer?.selectedAccountIds.includes(a.socialAccountId) && a.prices?.[currency] === undefined).map(async (a) => {
                try {
                    const matches = await searchPromoAccounts({ query: a.username ?? "", socialMedias: [a.socialMedia], page: 1, limit: 50 });
                    const exact = matches.filter((m) => m.accountId === a.socialAccountId && m.influencerId === a.influencerId && m.socialMedia === a.socialMedia);
                    if (exact.length === 1) accounts.set(a.socialAccountId, exact[0]);
                } catch { /* Missing metadata stays unavailable, never a zero or FX fallback. */ }
            });
            const catalogue = preview?.catalogContext ?? (preview?.genre ? { platform: preview.socialMedia, genre: preview.genre } : null);
            if (offer && preview?.prices?.[currency] === undefined && catalogue?.platform && catalogue?.genre) jobs.push((async () => {
                try {
                    const published = (await getPublishedOffers(catalogue.platform, catalogue.genre)).find((o) => o.id === offer.offerId);
                    const matches = published && JSON.stringify(published.connectedAccounts.map((a) => a.accountId).sort()) === JSON.stringify([...offer.selectedAccountIds].sort());
                    offerMetadata = matches ? { ...preview, prices: published.prices, isAvailable: true } : { ...preview, isAvailable: false };
                } catch { offerMetadata = { ...preview, isAvailable: false }; }
            })());
            await Promise.all(jobs);
            if (!owns()) { if (live()) setError("The source reader changed while loading. Reopen Add Influencer."); return; }
            cache = useProposalAccountsStore.getState();
            if (proposalWorkingFingerprint(cache, parsed.optionIndex) !== baseline || Object.keys(useUpdateCampaign.getState().patches).length) throw new Error("The source option changed while loading. Reopen Add Influencer to keep the latest edits.");
            const prepared = prepareProposalAddInfluencerBuilder(cache, parsed.optionIndex, parent.campaignName, { accounts, offer: offerMetadata });
            useCampaignBuilderStore.getState().actions.hydrateFromDraft({ ...prepared, proposalAddSession: { ...parsed, sessionId: token, currency, baseline, requestKey: ownerKey, requestVersion: version, completed: false,
                placements: prepared.selectedAccounts.map((a: any) => ({ selectionId: a.selectionId, addedAccountsId: a.addedAccountsId, accountId: a.accountId, influencerId: a.influencerId, socialMedia: a.socialMedia })) } });
            if (!live()) return;
            setReadyKey(key);
            if (!parsed.sessionId || params.get("currency") !== currency) {
                const next = new URLSearchParams(params); next.set('session', token); next.set('currency', currency);
                if (!next.has('platform') && prepared.offerCatalogContext) next.set('platform', prepared.offerCatalogContext.platform);
                if (!next.has('genre') && prepared.offerCatalogContext) next.set('genre', prepared.offerCatalogContext.genre);
                navigate(`${path}?${next}`, { replace: true });
            }
        };
        void prepare().catch((e) => { if (live()) setError(e instanceof Error ? e.message : "Failed to open Add Influencer."); });
        return () => { cancelled = true; };
    }, [key]);
    const session = builder.proposalAddSession;
    React.useEffect(() => {
        if (!parsed || readyKey !== key || session?.sessionId !== token || session.completed || params.get('currency') === session.currency) return;
        const next = new URLSearchParams(params); next.set('session', token); next.set('currency', session.currency);
        navigate(`${path}?${next}`, { replace: true });
    }, [readyKey, key, params.toString(), session?.currency]);
    const ready = Boolean(parsed && readyKey === key && session?.sessionId === token && !session.completed && params.get('currency') === session.currency);
    const owns = () => {
        const active = useCampaignBuilderStore.getState().proposalAddSession;
        return mounted.current && latestKey.current === key && active?.sessionId === token && !active.completed && parsed && active.campaignId === parsed.campaignId && active.optionIndex === parsed.optionIndex;
    };
    const finish = (payload?: any) => {
        if (!ready || !owns() || applying.current) return false;
        applying.current = true;
        try {
            const active = useCampaignBuilderStore.getState(), context = active.proposalAddSession!;
            const cache = useProposalAccountsStore.getState();
            if (cache.currentCampaignId !== context.campaignId || proposalWorkingFingerprint(cache, context.optionIndex) !== context.baseline ||
                useFetchCampaign.getState().requestKey !== context.requestKey || useFetchCampaign.getState().requestVersion !== context.requestVersion || Object.keys(useUpdateCampaign.getState().patches).length) throw new Error("The source editor changed. Return to the Proposal before applying this session.");
            if (!active.totalPriceReady || currencyCode(active.selectedCurrency) !== context.currency) throw new Error("Prices are unavailable in the source option currency. Review the selection.");
            const result = buildProposalAddWorkingResult(active, cache, context, payload);
            useProposalAccountsStore.setState({ accountsByOption: { ...cache.accountsByOption, [context.optionIndex]: result.accounts },
                contentByOption: { ...cache.contentByOption, [context.optionIndex]: result.campaignContent },
                selectedOfferChangeByOption: { ...cache.selectedOfferChangeByOption, ...(result.selectedOfferChange !== undefined ? { [context.optionIndex]: result.selectedOfferChange } : {}) },
                offerPreviewByOption: { ...cache.offerPreviewByOption, [context.optionIndex]: result.offerPreview } });
            useCampaignBuilderStore.setState({ proposalAddSession: { ...context, completed: true } });
            sessionStorage.setItem("lastCampaign", JSON.stringify({ id: context.campaignId, status: "proposal", optionIndex: context.optionIndex }));
            navigate("/client/campaign", { replace: true });
            return true;
        } catch (e) { if (owns()) toast.error(e instanceof Error ? e.message : "Failed to apply Add Influencer changes."); return false; }
        finally { applying.current = false; }
    };
    const cancel = () => {
        if (!owns()) return;
        const context = useCampaignBuilderStore.getState().proposalAddSession!;
        if (useProposalAccountsStore.getState().currentCampaignId !== context.campaignId || useFetchCampaign.getState().requestKey !== context.requestKey || useFetchCampaign.getState().requestVersion !== context.requestVersion) { toast.error("The source reader changed. Reopen the requested Proposal."); return; }
        useCampaignBuilderStore.getState().actions.reset();
        sessionStorage.setItem("lastCampaign", JSON.stringify({ id: context.campaignId, status: "proposal", optionIndex: context.optionIndex }));
        navigate("/client/campaign", { replace: true });
    };
    const backToSelection = () => {
        if (!owns()) return;
        const context = useCampaignBuilderStore.getState().proposalAddSession!;
        if (useFetchCampaign.getState().requestKey === context.requestKey && useFetchCampaign.getState().requestVersion === context.requestVersion) navigate(`/client/create-campaign?${params}`);
    };
    let plan = { accounts: [] as any[], missingGroups: [] as string[] }, planError = "";
    if (ready && session) try { plan = initializeProposalAddContent(builder.selectedAccounts, useProposalAccountsStore.getState().contentByOption[session.optionIndex] ?? [], useProposalAccountsStore.getState().optionSnapshotsByIndex[session.optionIndex]); }
    catch (e) { planError = (e as Error).message; }
    return { requested, ready, error: invalid || error || planError, finish, cancel, backToSelection, plan, session };
};
