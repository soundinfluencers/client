import { useQueryClient } from "@tanstack/react-query";
import { useCreateProposalOption } from "./use-create-proposal-option";
import { buildCloneProposalOption, OPTION_CREATE_MODE } from "@/client-side/utils/proposal-option-create";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { serializeCampaignContent } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import { assertProposalPatchDescriptions, buildProposalOptionPatchBody, dirtyProposalOptions, proposalEditorPatches } from "@/client-side/utils/proposal-option-patch";
import { BUNDLES_AVAILABLE } from "@/shared/config/bundle-availability";
import { ObjectId } from "bson";
import { assertProposalAddSource, proposalAddUrl } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder";
import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getProposalCampaign,
  deleteProposalOption,
  patchAddProposalOption,
  patchCampaign,
} from "@/api/client/campaign/campaign.api";
import { getPdfFile } from "@/api/client/file/get-pdf";
import { getCsvFile } from "@/api/client/file/get-csv";
import {
  useDraftCampaignStore,
  useFetchCampaign,
  useProposalAccountsStore,
  useStrategyCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import {
  buildProposalPatchBody,
  downloadBlob,
} from "@/client-side/utils";
import {
  buildPromoShareUrl,
  buildShareUrl,
  getCampaignActionId,
  getNextActiveOptionAfterDelete,
  getOptionIndexes,
} from "./campaign-page.utils";
import {
  filterContentWithAccounts,
  getAccountsByContentId,
} from "@/client-side/widgets/campaign/model/campaign-content.utils.ts";

type Params = {
  data: any;
  activeOption: number;
  setActiveOption: React.Dispatch<React.SetStateAction<number>>;
  localExtraOptions: number[];
  setLocalExtraOptions: React.Dispatch<React.SetStateAction<number[]>>;
  textareaValue: string;
  setOptionModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRequesting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRequestSent: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRequestingPDF: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useCampaignPageActions = ({
  data,
  activeOption,
  setActiveOption,
  localExtraOptions,
  setLocalExtraOptions,
  textareaValue,
  setOptionModal,
  setIsRequesting,
  setIsRequestSent,
  setIsRequestingPDF,
}: Params) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deletedProposal = React.useRef<string | null>(null);
  const campaignIdForActions = getCampaignActionId(data);
  const isMounted = React.useRef(false);
  const operationBusy = React.useRef(false);
  const addInfluencerStarted = React.useRef(false);
  const awaitingRead = React.useRef<{ key: string; target: number; kind: "patch" | "delete"; deletedIndex?: number; passive?: boolean; patches?: Record<string, any>; patchOwnerKey?: string; contentIds?: string[]; uncertain?: boolean; snapshotsBeforeDelete?: Record<number, any> } | null>(null);
  const [needsProposalRead, setNeedsProposalRead] = React.useState(false);
  const ownerRef = React.useRef("");
  if (data?.kind === "proposal") ownerRef.current = 'proposal:' + data.campaignId + ':' + activeOption;
  else if (data) ownerRef.current = '';
  const optionCreate = useCreateProposalOption(data?.kind === "proposal" ? data.campaignId : data ? "" : ownerRef.current.split(":")[1] ?? "");
  const owns = (key: string) => isMounted.current && ownerRef.current === key && useFetchCampaign.getState().requestKey === key;
  React.useEffect(() => {
    const pending = awaitingRead.current;
    if (pending && data && (data.kind !== "proposal" || data.campaignId !== pending.key.split(":")[1] || (ownerRef.current !== pending.key && data.selectedOption?.optionIndex !== pending.target))) {
      awaitingRead.current = null;
      setNeedsProposalRead(false);
    }
  }, [data?.kind, data?.campaignId, activeOption]);

  React.useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const optionIndexes = React.useMemo(
    () => getOptionIndexes(data, localExtraOptions),
    [data, localExtraOptions],
  );

  const reloadProposalOption = React.useCallback(
    async (optionIndex: number, campaignId = data?.campaignId, ownerKey?: string, hydrate = true) => {
      if (!campaignId) return null;

      const refreshed = await useFetchCampaign
      .getState()
      .setProposalOption(campaignId, optionIndex);

      if (hydrate && refreshed?.kind === "proposal" && isMounted.current && useFetchCampaign.getState().requestKey === `proposal:${campaignId}:${optionIndex}` && (!ownerKey || ownerRef.current === ownerKey) && refreshed.campaignId === campaignId && refreshed.selectedOption?.optionIndex === optionIndex) {
        useProposalAccountsStore.getState().initOption(
          optionIndex,
          refreshed.selectedOption?.addedAccounts ?? [],
          refreshed.selectedOption?.campaignContent ?? [],
          { force: true, snapshot: refreshed.selectedOption },
        );
      }

      return refreshed;
    },
    [data?.campaignId],
  );

  const onClickOption = React.useCallback(async (optionIndex: number) => {
    if (!campaignIdForActions || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved()) return;
    const key = 'proposal:' + campaignIdForActions + ':' + activeOption;
    if (!owns(key)) return;
    if (dirtyProposalOptions(useProposalAccountsStore.getState(), useUpdateCampaign.getState().patches, activeOption).includes(activeOption)) { toast.error('Save or discard the current option edits before switching.'); return; }
    // Dispose only this editor's remaining no-op patches before the target GET can publish.
    useUpdateCampaign.getState().reset();
    operationBusy.current = true; setIsRequesting(true);
    try {
      const refreshed = await reloadProposalOption(optionIndex, campaignIdForActions, key, false);
      if (!refreshed || !isMounted.current || (ownerRef.current !== key && ownerRef.current !== `proposal:${campaignIdForActions}:${optionIndex}`) || useFetchCampaign.getState().requestKey !== 'proposal:' + campaignIdForActions + ':' + optionIndex) return;
      const state = useProposalAccountsStore.getState();
      const preserveTarget = dirtyProposalOptions(state, {}, optionIndex).includes(optionIndex);
      state.initOption(optionIndex, refreshed.selectedOption.addedAccounts, refreshed.selectedOption.campaignContent, { force: !preserveTarget, snapshot: refreshed.selectedOption });
      setActiveOption(optionIndex); setIsRequestSent(false);
    } finally { operationBusy.current = false; if (isMounted.current && (ownerRef.current === key || ownerRef.current === `proposal:${campaignIdForActions}:${optionIndex}`)) setIsRequesting(false); }
  }, [campaignIdForActions, activeOption, reloadProposalOption]);

  const getCSV = React.useCallback(
    async (id: string) => {
      try {
        setIsRequesting(true);

        const res = await getCsvFile(id);
        downloadBlob(res.data as Blob, `campaign-${id}.csv`);

        toast.success("CSV created successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create CSV");
      } finally {
        setIsRequesting(false);
      }
    },
    [setIsRequesting],
  );

  const getPDF = React.useCallback(
    async (id: string) => {
      try {
        setIsRequestingPDF(true);

        const res = await getPdfFile(id);
        downloadBlob(res.data as Blob, `campaign-${id}.pdf`);

        toast.success("PDF created successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create PDF");
      } finally {
        setIsRequestingPDF(false);
      }
    },
    [setIsRequestingPDF],
  );

  const detachSourceEditorPatches = (source: number, key: string) => {
    if (!owns(key)) return;
    const patches = useUpdateCampaign.getState().patches;
    const state = useProposalAccountsStore.getState();
    // Keep any late source edits in its own working content before changing editors.
    const content = state.contentByOption[source] ?? [];
    if (Object.keys(patches).some((id) => !content.some((c) => c._id === id))) throw new Error('Review unmatched source content edits before opening the new option.');
    if (Object.keys(patches).length) useProposalAccountsStore.setState({ contentByOption: { ...state.contentByOption,
      [source]: serializeCampaignContent(content.map((c) => ({ ...c, ...(patches[c._id] ?? {}) }))) } });
    useUpdateCampaign.getState().reset();
  };
  const onAddOption = async (clone: boolean) => {
    if (optionCreate.needsRead) return retryProposalRead();
    if (!clone) return onStartProposalOptionCreate();
    const key = 'proposal:' + campaignIdForActions + ':' + activeOption;
    if (data?.kind !== 'proposal' || !owns(key) || operationBusy.current || awaitingRead.current || optionCreate.isBlocked) return false;
    if (!optionCreate.hasIdentity() && getDirtyProposalOptions().includes(activeOption)) { toast.error('Save or discard source option changes before cloning.'); return false; }
    operationBusy.current = true; setIsRequesting(true);
    try {
      const body = optionCreate.hasIdentity() ? null : buildCloneProposalOption(data.campaignName, data.socialMedia, useProposalAccountsStore.getState().optionSnapshotsByIndex[activeOption]);
      const fresh = await optionCreate.submit(body, activeOption, () => detachSourceEditorPatches(activeOption, key));
      if (!fresh || !isMounted.current) return false;
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('lastCampaign', JSON.stringify({ id: fresh.campaignId, status: 'proposal', optionIndex: fresh.selectedOption.optionIndex }));
      setOptionModal(false); setLocalExtraOptions([]); setActiveOption(fresh.selectedOption.optionIndex); setIsRequestSent(false);
      toast.success('Proposal option added successfully!'); return true;
    } catch (error) { if (owns(key)) toast.error(error instanceof Error ? error.message : 'Failed to clone option'); return false; }
    finally { operationBusy.current = false; if (isMounted.current) setIsRequesting(false); }
  };
  const onStartProposalOptionCreate = () => {
    const key = 'proposal:' + campaignIdForActions + ':' + activeOption;
    const state = useProposalAccountsStore.getState(); const source = state.optionSnapshotsByIndex[activeOption];
    if (data?.kind !== 'proposal' || !owns(key) || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved() || !source?.canEdit) return false;
    if (getDirtyProposalOptions().includes(activeOption)) { toast.error('Save or discard source option changes before creating an option.'); return false; }
    if (source.addedBundles?.length || source.addedAccounts.some((a: any) => a.bundleId || a.campaignBundleId)) { toast.error('Bundle option creation is unavailable.'); return false; }
    if (!['EUR', 'USD', 'GBP'].includes(source.displayCurrency)) { toast.error('Proposal currency is unavailable.'); return false; }
    detachSourceEditorPatches(activeOption, key);
    const builder = useCampaignBuilderStore.getState(); builder.actions.reset(); builder.actions.setCampaignName(data.campaignName); builder.actions.setSelectedCurrency(source.displayCurrency);
    setOptionModal(false);
    navigate('/client/create-campaign?' + new URLSearchParams({ mode: OPTION_CREATE_MODE, campaignId: campaignIdForActions, sourceOption: String(activeOption), currency: source.displayCurrency }));
    return true;
  };
  const onAddInfluencer = (index: number) => {
    const key = `proposal:${campaignIdForActions}:${activeOption}`;
    if (data?.kind !== 'proposal' || index !== activeOption || !owns(key) || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved() || addInfluencerStarted.current) return false;
    try {
      const state = useProposalAccountsStore.getState(), snapshot = state.optionSnapshotsByIndex[index];
      assertProposalAddSource(snapshot, state.accountsByOption[index] ?? []);
      detachSourceEditorPatches(index, key);
      addInfluencerStarted.current = true;
      const catalogue = state.offerPreviewByOption[index]?.catalogContext ?? (snapshot.selectedOffer?.genre ? { platform: snapshot.selectedOffer.socialMedia, genre: snapshot.selectedOffer.genre } : null);
      navigate(proposalAddUrl({ campaignId: campaignIdForActions, optionIndex: index, sessionId: new ObjectId().toHexString() }, snapshot.displayCurrency, '/client/create-campaign', catalogue));
      return true;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to open Add Influencer'); return false; }
  };

  const currentWriteContext = (key: string) => {
    const prefix = key.split(':').slice(0, 2).join(':') + ':';
    const pending = awaitingRead.current;
    return isMounted.current && (ownerRef.current === key || (pending?.key === key && !pending.passive && ownerRef.current === prefix + pending.target)) &&
      useFetchCampaign.getState().requestKey?.startsWith(prefix);
  };

  const clearWrittenPatches = (pending: NonNullable<typeof awaitingRead.current>) => {
    if (pending.patchOwnerKey !== pending.key || pending.target !== Number(pending.patchOwnerKey.split(":")[2])) return;
    useUpdateCampaign.setState((state) => {
      const patches = { ...state.patches };
      for (const id of pending.contentIds ?? []) if (patches[id] === pending.patches?.[id]) delete patches[id];
      return { patches };
    });
  };

  // Only a successful option DELETE followed by the campaign-level not-found
  // response can establish deletion. A missing selected option is insufficient.
  const finishDeletedProposal = (key: string) => {
    if (!currentWriteContext(key)) return false;
    const campaignId = key.split(':')[1];
    deletedProposal.current = campaignId;
    useFetchCampaign.getState().forgetProposal(campaignId);
    if (useProposalAccountsStore.getState().currentCampaignId === campaignId) {
      useProposalAccountsStore.getState().clearAll(); useUpdateCampaign.getState().reset();
    }
    const builder = useCampaignBuilderStore.getState();
    if (builder.proposalAddSession?.campaignId === campaignId) builder.actions.reset();
    if (typeof sessionStorage !== 'undefined') {
      let removedDetailsReference = false;
      try { if (JSON.parse(sessionStorage.getItem('lastCampaign') ?? 'null')?.id === campaignId) { removedDetailsReference = true; sessionStorage.removeItem('lastCampaign'); } } catch { /* Preserve unrelated navigation state. */ }
      try {
        const redirect = JSON.parse(sessionStorage.getItem('postAuthRedirect') ?? 'null');
        if (redirect?.campaignId === campaignId || (typeof redirect?.path === 'string' && new URL(redirect.path, 'https://local.invalid').searchParams.get('proposal') === campaignId) || (removedDetailsReference && !redirect?.campaignId && redirect?.path === '/client/campaign')) sessionStorage.removeItem('postAuthRedirect');
      } catch { /* Preserve unrelated redirects. */ }
    }
    awaitingRead.current = null; setNeedsProposalRead(false); setLocalExtraOptions([]);
    void queryClient.invalidateQueries({ queryKey: ['dashboard-campaigns'] });
    navigate('/client', { replace: true }); toast.success('Proposal deleted successfully!'); return true;
  };

  const synchronizeWrite = async (key: string, target: number) => {
    const pending = awaitingRead.current;
    if (!pending || !currentWriteContext(key)) return false;
    if (pending.uncertain) { toast.error("Deletion outcome is unknown. Reopen from the dashboard to review; do not repeat deletion."); return false; }
    // Pending is visible from the moment write success is known, including displaced reads.
    setNeedsProposalRead(true);
    const campaignId = key.split(':')[1];
    const read = pending.passive ? getProposalCampaign(campaignId, target).then((response) => {
      const payload = (response.data as any).data ?? response.data;
      return { ...payload, kind: 'proposal' };
    }).catch(() => null) : reloadProposalOption(target, campaignId, key, false);
    let readVersion = useFetchCampaign.getState().requestVersion;
    let refreshed = await read;
    if (!currentWriteContext(key)) return false;
    if (pending.kind === 'delete' && useFetchCampaign.getState().requestVersion === readVersion && !refreshed) {
      const error = useFetchCampaign.getState().error;
      // The backend distinguishes a missing campaign from a missing option.
      if (error?.response?.status === 404 && error?.response?.data?.message === 'Proposal campaign not found') return finishDeletedProposal(key);
      if (target !== 0 && error?.response?.status === 404 && error?.response?.data?.message === 'Selected proposal campaign option not found') {
        target = 0; pending.target = 0;
        const fallback = reloadProposalOption(0, campaignId, key, false);
        readVersion = useFetchCampaign.getState().requestVersion;
        refreshed = await fallback;
        if (!currentWriteContext(key)) return false;
        const fallbackError = useFetchCampaign.getState().error;
        if (useFetchCampaign.getState().requestVersion === readVersion && !refreshed && fallbackError?.response?.status === 404 && fallbackError?.response?.data?.message === 'Proposal campaign not found') return finishDeletedProposal(key);
      }
    }
    if (useFetchCampaign.getState().requestVersion !== readVersion || !refreshed ||
        refreshed.campaignId !== campaignId || refreshed.selectedOption?.optionIndex !== target) {
      setNeedsProposalRead(true);
      toast.error('Write succeeded, but reading was interrupted or failed. Retry reading; do not repeat the write.');
      return false;
    }
    if (pending.kind === 'delete') {
      const state = useProposalAccountsStore.getState();
      const preserve = dirtyProposalOptions(state, useUpdateCampaign.getState().patches, target).includes(target);
      state.initOption(target, refreshed.selectedOption.addedAccounts, refreshed.selectedOption.campaignContent, { force: !preserve, snapshot: refreshed.selectedOption });
    } else {
      useProposalAccountsStore.getState().initOption(target, refreshed.selectedOption.addedAccounts, refreshed.selectedOption.campaignContent, { force: true, snapshot: refreshed.selectedOption });
      clearWrittenPatches(pending);
    }
    awaitingRead.current = null; setNeedsProposalRead(false);
    setLocalExtraOptions([]); if (!pending.passive) setActiveOption(target); setIsRequestSent(true);
    return true;
  };

  const retryProposalRead = async () => {
    if (optionCreate.needsRead) {
      if (operationBusy.current) return false;
      operationBusy.current = true; setIsRequesting(true);
      try {
        const fresh = await optionCreate.retry();
        if (!fresh) return false;
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('lastCampaign', JSON.stringify({ id: fresh.campaignId, status: 'proposal', optionIndex: fresh.selectedOption.optionIndex }));
        setOptionModal(false); setLocalExtraOptions([]); setActiveOption(fresh.selectedOption.optionIndex); setIsRequestSent(false);
        return true;
      }
      finally { operationBusy.current = false; if (isMounted.current) setIsRequesting(false); }
    }
    const pending = awaitingRead.current;
    if (!pending || operationBusy.current || !currentWriteContext(pending.key)) return false;
    operationBusy.current = true; setIsRequesting(true);
    try { return await synchronizeWrite(pending.key, pending.target); }
    finally { operationBusy.current = false; if (currentWriteContext(pending.key) || (pending.kind === 'delete' && isMounted.current && ownerRef.current.startsWith(pending.key.split(':').slice(0, 2).join(':') + ':'))) setIsRequesting(false); }
  };

  const getDirtyProposalOptions = () => dirtyProposalOptions(useProposalAccountsStore.getState(), useUpdateCampaign.getState().patches ?? {}, activeOption);

  const onDeleteOption = React.useCallback(async (deletedOptionIndex: number) => {
    if (data?.kind !== 'proposal' || deletedProposal.current === data.campaignId || !data.selectedOption?.canEdit || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved()) return false;
    const key = 'proposal:' + data.campaignId + ':' + activeOption;
    const currentOptions = getOptionIndexes(data, localExtraOptions);
    if (!owns(key) || !data.selectedOption?.canEdit || !currentOptions.includes(deletedOptionIndex)) return false;
    const target = getNextActiveOptionAfterDelete({ activeOption, deletedOption: deletedOptionIndex, optionsCount: currentOptions.length });
    operationBusy.current = true; setIsRequesting(true);
    try {
      const version = useFetchCampaign.getState().requestVersion;
      const snapshotsBeforeDelete = useProposalAccountsStore.getState().optionSnapshotsByIndex;
      await deleteProposalOption(data.campaignId, deletedOptionIndex);
      if (!currentWriteContext(key)) return false;
      // Once deletion of the editor itself is confirmed, its patch map must never
      // be interpreted as edits of the option which inherits the same index.
      if (deletedOptionIndex === activeOption) useUpdateCampaign.getState().reset();
      // Reindex every cached option by its old identity. Never attach old working rows
      // to another option or erase edits introduced while the DELETE was in flight.
      useProposalAccountsStore.setState((state) => {
        const reindex = (map: Record<number, any>, snapshots = false) => Object.fromEntries(Object.entries(map).flatMap(([rawIndex, value]) => {
          const index = Number(rawIndex); if (index === deletedOptionIndex) return [];
          const nextIndex = index > deletedOptionIndex ? index - 1 : index;
          return [[nextIndex, snapshots ? { ...value, optionIndex: nextIndex } : value]];
        }));
        return { optionSnapshotsByIndex: reindex(snapshotsBeforeDelete, true), accountsByOption: reindex(state.accountsByOption),
          contentByOption: reindex(state.contentByOption), selectedOfferChangeByOption: reindex(state.selectedOfferChangeByOption), offerPreviewByOption: reindex(state.offerPreviewByOption),
          recentlyAddedKeysByOption: reindex(state.recentlyAddedKeysByOption), pendingDeleteKeysByOption: reindex(state.pendingDeleteKeysByOption) };
      });
      awaitingRead.current = { key, target, kind: "delete", deletedIndex: deletedOptionIndex, snapshotsBeforeDelete };
      setNeedsProposalRead(true);
      if (useFetchCampaign.getState().requestVersion !== version) return false;
      const synced = await synchronizeWrite(key, target);
      if (synced) toast.success('Proposal option deleted successfully!');
      return synced;
    } catch (error: any) {
      if (owns(key)) {
        const status = error?.response?.status;
        if (!status || status >= 500 || status === 408) {
          awaitingRead.current = { key, target, kind: 'delete', uncertain: true }; setNeedsProposalRead(true);
          toast.error('Deletion outcome is unknown. Do not repeat DELETE; review from the dashboard.');
        } else toast.error(status === 409 ? 'Proposal options changed. Refresh and confirm again; deletion was not repeated.' : 'Failed to delete option');
      }
      return false;
    }
    finally { operationBusy.current = false; if (isMounted.current && ownerRef.current.startsWith(`proposal:${data.campaignId}:`)) setIsRequesting(false); }
  }, [data, activeOption, localExtraOptions, reloadProposalOption]);

  const updateProposalOption = React.useCallback(async (): Promise<boolean> => {
    if (data?.kind !== 'proposal' || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved()) return false;
    const key = 'proposal:' + data.campaignId + ':' + activeOption;
    if (!owns(key)) return false;
    operationBusy.current = true; setIsRequesting(true);
    try {
      const state = useProposalAccountsStore.getState();
      const snapshot = state.optionSnapshotsByIndex[activeOption];
      const accounts = state.accountsByOption[activeOption] ?? [];
      if (!BUNDLES_AVAILABLE && ((snapshot?.addedBundles?.length ?? 0) || accounts.some((a: any) => a.bundleId || a.campaignBundleId))) throw new Error('Bundle Proposal editing is unavailable. No selections were submitted.');
      const body = buildProposalOptionPatchBody({ campaignName: data.campaignName, snapshot, accounts,
        content: state.contentByOption[activeOption] ?? [], patches: useUpdateCampaign.getState().patches ?? {},
        selectedOfferChange: Object.hasOwn(state.selectedOfferChangeByOption, activeOption) ? state.selectedOfferChangeByOption[activeOption] : undefined });
      assertProposalPatchDescriptions(body.campaignContent);
      const version = useFetchCampaign.getState().requestVersion;
      const patches = useUpdateCampaign.getState().patches;
      await patchAddProposalOption(data.campaignId, activeOption, body);
      if (!currentWriteContext(key)) return false;
      awaitingRead.current = { key, target: activeOption, kind: "patch", patches, patchOwnerKey: key, contentIds: [...new Set([...snapshot.campaignContent, ...state.contentByOption[activeOption]].map((c) => c._id))] };
      setNeedsProposalRead(true);
      if (useFetchCampaign.getState().requestVersion !== version) return false;
      const synced = await synchronizeWrite(key, activeOption);
      if (synced) toast.success('Proposal campaign updated successfully!');
      return synced;
    } catch (error) { if (owns(key)) toast.error(error instanceof Error ? error.message : 'Failed to update proposal campaign'); return false; }
    finally { operationBusy.current = false; if (isMounted.current && ownerRef.current === key) setIsRequesting(false); }
  }, [data, activeOption, reloadProposalOption]);

  const saveDirtyProposalOptions = async () => {
    const key = 'proposal:' + campaignIdForActions + ':' + activeOption;
    if (!owns(key) || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved()) return false;
    operationBusy.current = true; setIsRequesting(true);
    try {
      for (const index of getDirtyProposalOptions().sort((a, b) => Number(b === activeOption) - Number(a === activeOption))) {
        if (!owns(key)) return false;
        const state = useProposalAccountsStore.getState(); const snapshot = state.optionSnapshotsByIndex[index];
        const accounts = state.accountsByOption[index] ?? [], content = state.contentByOption[index] ?? [];
        if (!BUNDLES_AVAILABLE && ((snapshot?.addedBundles?.length ?? 0) || accounts.some((a: any) => a.bundleId || a.campaignBundleId))) throw new Error('Bundle Proposal editing is unavailable.');
        const patches = proposalEditorPatches(useUpdateCampaign.getState().patches, index, activeOption);
        const body = buildProposalOptionPatchBody({ campaignName: data.campaignName, snapshot, accounts, content, patches, selectedOfferChange: state.selectedOfferChangeByOption[index] });
        assertProposalPatchDescriptions(body.campaignContent);
        const version = useFetchCampaign.getState().requestVersion;
        await patchAddProposalOption(campaignIdForActions, index, body);
        if (!currentWriteContext(key)) return false;
        awaitingRead.current = { key, target: index, kind: 'patch', passive: true, patches, patchOwnerKey: index === activeOption ? key : undefined, contentIds: [...new Set([...snapshot.campaignContent, ...content].map((c) => c._id))] };
        setNeedsProposalRead(true);
        if (version !== useFetchCampaign.getState().requestVersion || !await synchronizeWrite(key, index)) return false;
      }
      if (getDirtyProposalOptions().length) throw new Error('Some option edits cannot be matched to their content. Review them before deleting.');
      return true;
    } catch (error) { if (currentWriteContext(key)) toast.error(error instanceof Error ? error.message : 'Failed to save option changes'); return false; }
    finally { operationBusy.current = false; if (currentWriteContext(key)) setIsRequesting(false); }
  };

  const discardDirtyProposalOptions = () => {
    const key = 'proposal:' + campaignIdForActions + ':' + activeOption;
    if (!owns(key) || operationBusy.current || awaitingRead.current || optionCreate.isUnresolved()) return false;
    const state = useProposalAccountsStore.getState(); const dirty = getDirtyProposalOptions();
    if (dirty.some((index) => !state.optionSnapshotsByIndex[index])) return false;
    for (const index of dirty) state.restoreOptionFromSnapshot(index);
    useUpdateCampaign.getState().reset();
    return true;
  };

  const updateStrategyCampaign = React.useCallback(async () => {
    if (!data?.campaignId) return;

    try {
      setIsRequesting(true);

      const strategyState = useStrategyCampaignStore.getState();

      const accounts =
        strategyState.accountsByCampaignId[data.campaignId] ?? [];

      const content =
        strategyState.contentByCampaignId[data.campaignId] ?? [];

      const patches = useUpdateCampaign.getState().patches ?? {};

      const body = buildProposalPatchBody({
        campaignName: data.campaignName,
        accounts,
        content,
        patches,
      });

      await patchCampaign(data.campaignId, body);

      useUpdateCampaign.getState().reset();

      const refreshed = await useFetchCampaign
      .getState()
      .setCampaign(data.campaignId);

      const fresh = refreshed ?? useFetchCampaign.getState().data;

      if (fresh?.kind === "regular") {
        useStrategyCampaignStore.getState().initCampaign(
          fresh.campaignId,
          fresh.addedAccounts ?? [],
          fresh.campaignContent ?? [],
          { force: true },
        );
      }

      toast.success("Strategy campaign updated successfully!");
      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update strategy campaign");
    } finally {
      setIsRequesting(false);
    }
  }, [data, setIsRequesting, setIsRequestSent]);

  const proceedDraftToPayment = React.useCallback(async () => {
    const draftId = String(data?.draftId ?? "");

    if (!draftId) return;

    const draftState = useDraftCampaignStore.getState();

    const accounts = draftState.accountsByCampaignId[draftId] ?? [];
    const content = draftState.contentByCampaignId[draftId] ?? [];
    const patches = useUpdateCampaign.getState().patches ?? {};

    const body = buildProposalPatchBody({
      campaignName: data.campaignName,
      accounts,
      content,
      patches,
    });

    useDraftCampaignStore.getState().setDraftPayload(draftId, body);

    navigate(`/client/campaign/payment?draft=${draftId}`);
  }, [data, navigate]);

  const copyPromoShareLink = React.useCallback(async () => {
    try {
      const url = buildPromoShareUrl(campaignIdForActions);

      await navigator.clipboard.writeText(url);

      toast.success("Shared link copied successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy share link");
    }
  }, [campaignIdForActions]);

  const copyShareLink = React.useCallback(async () => {
    if (!data?.socialMedia) {
      toast.error("Social media is missing");
      return;
    }

    try {
      const url = buildShareUrl(campaignIdForActions, data.socialMedia);

      await navigator.clipboard.writeText(url);

      toast.success("Shared link copied successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy share link");
    }
  }, [campaignIdForActions, data?.socialMedia]);
  const visibleStats = React.useMemo(() => {
    const campaignAccounts =
      data?.kind === "proposal"
        ? data?.selectedOption?.addedAccounts ?? []
        : data?.addedAccounts ?? [];

    const campaignContent =
      data?.kind === "proposal"
        ? data?.selectedOption?.campaignContent ?? []
        : data?.campaignContent ?? [];

    const accountsByContentId = getAccountsByContentId(campaignAccounts);

    const visibleContent = filterContentWithAccounts({
      content: campaignContent,
      accountsByContentId,
    });

    const visibleContentIds = new Set(
      visibleContent.map((item: any) => String(item?._id ?? "")),
    );

    const visibleAccounts = campaignAccounts.filter((account: any) => {
      const contentId = String(
        account?.selectedContent?.campaignContentItemId ??
        account?.selectedCampaignContentItem?.campaignContentItemId ??
        account?.selectedContentItem?._id ??
        "",
      );

      return visibleContentIds.has(contentId);
    });

    return {
      visibleAccounts,
      visibleContent,
      postsCount: visibleAccounts.length,
      videosCount: visibleContent.length,
    };
  }, [data]);
  return {
    onAddInfluencer,
    beginOptionCreate: optionCreate.begin, onStartProposalOptionCreate, optionCreateBlocked: optionCreate.isBlocked,
    getPendingProposalWrite: () => awaitingRead.current,
    needsProposalRead: optionCreate.needsRead || (needsProposalRead && Boolean(awaitingRead.current && currentWriteContext(awaitingRead.current.key))), retryProposalRead, getDirtyProposalOptions, saveDirtyProposalOptions, discardDirtyProposalOptions,
    campaignIdForActions,
    optionIndexes,
    onClickOption,
    getCSV,
    getPDF,
    onAddOption,
    onDeleteOption,
    updateProposalOption,
    updateStrategyCampaign,
    proceedDraftToPayment,
    copyShareLink,
    copyPromoShareLink,
    visibleStats,
  };
};
