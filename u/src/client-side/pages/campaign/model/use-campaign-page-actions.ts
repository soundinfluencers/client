import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    deleteProposalOption,
    patchAddProposalOption,
    patchCampaign,
    postCampaignRequest,
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
    calcGroupPrices,
    downloadBlob,
} from "@/client-side/utils";
import {
    buildPromoShareUrl, buildShareUrl,
    getCampaignActionId,
    getOptionIndexes,
} from "./campaign-page.utils";

type Params = {
    data: any;
    activeOption: number;
    setActiveOption: React.Dispatch<React.SetStateAction<number>>;
    localExtraOptions: number[];
    setLocalExtraOptions: React.Dispatch<React.SetStateAction<number[]>>;
    textareaValue: string;
    setRequestModal: React.Dispatch<React.SetStateAction<boolean>>;
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
                                           setRequestModal,
                                           setOptionModal,
                                           setIsRequesting,
                                           setIsRequestSent,
                                           setIsRequestingPDF,
                                       }: Params) => {
    const navigate = useNavigate();
    const campaignIdForActions = getCampaignActionId(data);

    const optionIndexes = React.useMemo(
        () => getOptionIndexes(data, localExtraOptions),
        [data, localExtraOptions],
    );

    const onClickOption = React.useCallback(
        (optionIndex: number) => {
            setIsRequestSent(false);
            setActiveOption(optionIndex);
            useFetchCampaign.getState().setProposalOption(campaignIdForActions, optionIndex);
        },
        [campaignIdForActions, setActiveOption, setIsRequestSent],
    );

    const getCSV = React.useCallback(async (id: string) => {
        try {
            setIsRequesting(true);
            const res = await getCsvFile(id);
            downloadBlob(res.data as Blob, `campaign-${id}.csv`);
            toast.success("CSV created succesfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setIsRequesting(false);
        }
    }, [setIsRequesting]);

    const getPDF = React.useCallback(async (id: string) => {
        try {
            setIsRequestingPDF(true);
            const res = await getPdfFile(id);
            downloadBlob(res.data as Blob, `campaign-${id}.pdf`);
            toast.success("PDF created succesfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setIsRequestingPDF(false);
        }
    }, [setIsRequestingPDF]);

    const onAddOption = React.useCallback(async (inheritFromOption0: boolean) => {
        if (data?.kind !== "proposal") return;

        const base = data.existingOptions ?? [];
        const all = [...base, ...localExtraOptions];
        const newIndex = all.length ? Math.max(...all) + 1 : 0;

        setLocalExtraOptions((prev) => [...prev, newIndex]);
        setOptionModal(false);

        try {
            setIsRequesting(true);
            await useFetchCampaign
                .getState()
                .addProposalOption(campaignIdForActions, inheritFromOption0);

            toast.success("Proposal Option added succesfully!");
        } catch (e) {
            console.error(e);
            setLocalExtraOptions((prev) => prev.filter((x) => x !== newIndex));
        } finally {
            setIsRequesting(false);
        }
    }, [
        data,
        localExtraOptions,
        setLocalExtraOptions,
        setOptionModal,
        setIsRequesting,
        campaignIdForActions,
    ]);

    const onDeleteOption = React.useCallback(async (idx: number) => {
        if (data?.kind !== "proposal") return;

        try {
            setIsRequesting(true);

            await deleteProposalOption(data.campaignId, idx);

            const freshMeta = await useFetchCampaign.getState().setProposalOption(
                data.campaignId,
                activeOption === idx ? 0 : activeOption,
            );

            if (freshMeta?.kind !== "proposal") return;

            const freshOptionIndexes = freshMeta.existingOptions ?? [];
            const nextActive =
                activeOption === idx
                    ? freshOptionIndexes.length
                        ? freshOptionIndexes[0]
                        : 0
                    : activeOption;

            setLocalExtraOptions([]);
            setActiveOption(nextActive);

            const refreshed = await useFetchCampaign
                .getState()
                .setProposalOption(data.campaignId, nextActive);

            if (refreshed?.kind === "proposal") {
                useProposalAccountsStore.getState().initOption(
                    nextActive,
                    refreshed.selectedOption.addedAccounts,
                    refreshed.selectedOption.campaignContent,
                    { force: true },
                );
            }
            setOptionModal(false)
            toast.success("Proposal option deleted successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete option");
        } finally {
            setIsRequesting(false);
        }
    }, [
        data,
        activeOption,
        setActiveOption,
        setLocalExtraOptions,
        setIsRequesting,
        setOptionModal
    ]);

    const requestCampaign = React.useCallback(async () => {
        try {
            setIsRequesting(true);
            await postCampaignRequest(campaignIdForActions, textareaValue);
            toast.success("Request Campaign sent succesfully!");
            setIsRequestSent(true);
        } catch (e) {
            console.error(e);
        } finally {
            setRequestModal(false);
            setIsRequesting(false);
        }
    }, [
        campaignIdForActions,
        textareaValue,
        setIsRequesting,
        setIsRequestSent,
        setRequestModal,
    ]);

    const updateProposalOption = React.useCallback(async () => {
        if (!data?.campaignId) return;

        setIsRequesting(true);

        try {
            const st = useProposalAccountsStore.getState();
            const accounts = st.accountsByOption[activeOption] ?? [];
            const content = st.contentByOption[activeOption] ?? [];
            const patches = useUpdateCampaign.getState().patches ?? {};
            const { totalPublicPrice } = calcGroupPrices(accounts);

            const body = buildProposalPatchBody({
                campaignName: data.campaignName,
                accounts,
                content,
                patches,
                totalPublicPrice,
            });

            await patchAddProposalOption(data.campaignId, activeOption, body);

            useUpdateCampaign.getState().reset();
            await useFetchCampaign.getState().setProposalOption(data.campaignId, activeOption);

            const fresh = useFetchCampaign.getState().data;
            if (fresh?.kind === "proposal") {
                useProposalAccountsStore
                    .getState()
                    .initOption(
                        activeOption,
                        fresh.selectedOption.addedAccounts,
                        fresh.selectedOption.campaignContent,
                        { force: true },
                    );
            }

            toast.success("Proposal Campaign updated succesfully!");
            setIsRequestSent(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRequesting(false);
        }
    }, [data, activeOption, setIsRequesting, setIsRequestSent]);

    const updateStrategyCampaign = React.useCallback(async () => {
        if (!data?.campaignId) return;

        try {
            setIsRequesting(true);

            const strategyState = useStrategyCampaignStore.getState();
            const accounts = strategyState.accountsByCampaignId[data.campaignId] ?? [];
            const content = strategyState.contentByCampaignId[data.campaignId] ?? [];
            const patches = useUpdateCampaign.getState().patches ?? {};

            const body = buildProposalPatchBody({
                campaignName: data.campaignName,
                accounts,
                content,
                patches,
            });

            await patchCampaign(data.campaignId, body);

            useUpdateCampaign.getState().reset();
            await useFetchCampaign.getState().setCampaign(data.campaignId);

            const fresh = useFetchCampaign.getState().data;
            if (fresh?.kind === "regular") {
                useStrategyCampaignStore
                    .getState()
                    .initCampaign(
                        fresh.campaignId,
                        fresh.addedAccounts,
                        fresh.campaignContent,
                        { force: true },
                    );
            }

            toast.success("Strategy Campaign updated succesfully!");
            setIsRequestSent(true);
        } catch (e) {
            console.error(e);
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
        const url = buildPromoShareUrl(campaignIdForActions);
        await navigator.clipboard.writeText(url);
        toast.success("Shared link created successfully!");
    }, [campaignIdForActions]);

    const copyShareLink = React.useCallback(async () => {
        if (!data?.socialMedia) {
            toast.error("Social media is missing");
            return;
        }

        const url = buildShareUrl(campaignIdForActions, data.socialMedia);
        await navigator.clipboard.writeText(url);
        toast.success("Shared link created successfully!");
    }, [campaignIdForActions, data?.socialMedia]);
    return {

        campaignIdForActions,
        optionIndexes,
        onClickOption,
        getCSV,
        getPDF,
        onAddOption,
        onDeleteOption,
        requestCampaign,
        updateProposalOption,
        updateStrategyCampaign,
        proceedDraftToPayment,
        copyShareLink,
        copyPromoShareLink
    };
};