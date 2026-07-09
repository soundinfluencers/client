import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
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
  calcGroupPrices,
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
  const campaignIdForActions = getCampaignActionId(data);

  const optionIndexes = React.useMemo(
    () => getOptionIndexes(data, localExtraOptions),
    [data, localExtraOptions],
  );

  const reloadProposalOption = React.useCallback(
    async (optionIndex: number) => {
      if (!data?.campaignId) return null;

      const refreshed = await useFetchCampaign
      .getState()
      .setProposalOption(data.campaignId, optionIndex);

      if (refreshed?.kind === "proposal") {
        useProposalAccountsStore.getState().initOption(
          optionIndex,
          refreshed.selectedOption?.addedAccounts ?? [],
          refreshed.selectedOption?.campaignContent ?? [],
          { force: true },
        );
      }

      return refreshed;
    },
    [data?.campaignId],
  );

  const onClickOption = React.useCallback(
    async (optionIndex: number) => {
      if (!campaignIdForActions) return;

      try {
        setIsRequestSent(false);
        setIsRequesting(true);
        setActiveOption(optionIndex);

        const refreshed = await useFetchCampaign
        .getState()
        .setProposalOption(campaignIdForActions, optionIndex);

        if (refreshed?.kind === "proposal") {
          useProposalAccountsStore.getState().initOption(
            optionIndex,
            refreshed.selectedOption?.addedAccounts ?? [],
            refreshed.selectedOption?.campaignContent ?? [],
            { force: true },
          );
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load option");
      } finally {
        setIsRequesting(false);
      }
    },
    [
      campaignIdForActions,
      setActiveOption,
      setIsRequestSent,
      setIsRequesting,
    ],
  );

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

  const onAddOption = React.useCallback(
    async (inheritFromCurrentOption: boolean) => {
      if (data?.kind !== "proposal") return;

      const currentOptions = getOptionIndexes(data, localExtraOptions);
      const nextOptionIndex = currentOptions.length;

      try {
        setIsRequesting(true);
        setOptionModal(false);

        await useFetchCampaign
        .getState()
        .addProposalOption(campaignIdForActions, inheritFromCurrentOption);

        useUpdateCampaign.getState().reset();

        setLocalExtraOptions([]);
        setActiveOption(nextOptionIndex);
        setIsRequestSent(false);

        await reloadProposalOption(nextOptionIndex);

        toast.success("Proposal option added successfully!");
      } catch (e) {
        console.error(e);
        toast.error("Failed to add proposal option");
      } finally {
        setIsRequesting(false);
      }
    },
    [
      data,
      localExtraOptions,
      campaignIdForActions,
      setLocalExtraOptions,
      setActiveOption,
      setOptionModal,
      setIsRequesting,
      setIsRequestSent,
      reloadProposalOption,
    ],
  );

  const onDeleteOption = React.useCallback(
    async (deletedOptionIndex: number) => {
      if (data?.kind !== "proposal") return;

      const currentOptions = getOptionIndexes(data, localExtraOptions);

      if (currentOptions.length <= 1) {
        toast.error("You cannot delete the last option");
        return;
      }

      const nextActiveOption = getNextActiveOptionAfterDelete({
        activeOption,
        deletedOption: deletedOptionIndex,
        optionsCount: currentOptions.length,
      });

      try {
        setIsRequesting(true);

        await deleteProposalOption(data.campaignId, deletedOptionIndex);

        useUpdateCampaign.getState().reset();

        setLocalExtraOptions([]);
        setActiveOption(nextActiveOption);
        setIsRequestSent(false);

        await reloadProposalOption(nextActiveOption);

        toast.success("Proposal option deleted successfully!");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete option");
      } finally {
        setIsRequesting(false);
      }
    },
    [
      data,
      activeOption,
      localExtraOptions,
      setActiveOption,
      setLocalExtraOptions,
      setIsRequesting,
      setIsRequestSent,
      reloadProposalOption,
    ],
  );

  const updateProposalOption = React.useCallback(async () => {
    if (!data?.campaignId) return;

    try {
      setIsRequesting(true);

      const proposalState = useProposalAccountsStore.getState();

      const accounts = proposalState.accountsByOption[activeOption] ?? [];
      const content = proposalState.contentByOption[activeOption] ?? [];
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

      await reloadProposalOption(activeOption);

      toast.success("Proposal campaign updated successfully!");
      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update proposal campaign");
    } finally {
      setIsRequesting(false);
    }
  }, [
    data,
    activeOption,
    setIsRequesting,
    setIsRequestSent,
    reloadProposalOption,
  ]);

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
