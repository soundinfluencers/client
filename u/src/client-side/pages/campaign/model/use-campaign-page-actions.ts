import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  deleteProposalOption,
  patchCampaign,
} from "@/api/client/campaign/campaign.api";
import {
  patchProposalOption,
} from "@/entities/client-side/campaign/api/proposal-system.api.ts";
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
  buildProposalOptionPatchBody,
  downloadBlob,
} from "@/client-side/utils";
import {
  buildPromoShareUrl,
  buildShareUrl,
  getCampaignActionId,
  getNextActiveOptionAfterDelete,
  getOptionIndexes,
  isValidCreatedProposalOption,
  writeLastProposalOptionSession,
} from "./campaign-page.utils";
import {
  filterContentWithAccounts,
  getAccountsByContentId,
} from "@/client-side/widgets/campaign/model/campaign-content.utils.ts";
import {
  useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {
  buildProposalOptionCreateUrl,
  PROPOSAL_OPTION_CREATE_MODE,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation.ts";
import {
  isCampaignDisplayCurrency,
} from "@/shared/functions/formatCurrency.ts";
import {
  CreateProposalOptionResponseValidationError,
} from "@/entities/client-side/campaign/model/proposal-option-response.ts";
import {
  hydrateCreatedProposalOption,
} from "./hydrate-created-proposal-option";

type Params = {
  data: any;
  activeOption: number;
  setActiveOption: React.Dispatch<React.SetStateAction<number>>;
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
  setLocalExtraOptions,
  textareaValue,
  setOptionModal,
  setIsRequesting,
  setIsRequestSent,
  setIsRequestingPDF,
}: Params) => {
  const navigate = useNavigate();
  const isCreatingOptionRef = React.useRef(false);
  const campaignIdForActions = getCampaignActionId(data);

  const optionIndexes = React.useMemo(
    () => getOptionIndexes(data, []),
    [data],
  );

  const reloadProposalOption = React.useCallback(
    async (optionIndex: number) => {
      if (!data?.campaignId) return null;

      const refreshed = await useFetchCampaign
      .getState()
      .setProposalOption(data.campaignId, optionIndex);

      if (refreshed?.kind === "proposal") {
        const refreshedOptionIndex = refreshed.selectedOption.optionIndex;

        useProposalAccountsStore
          .getState()
          .setOptionSnapshot(refreshed.selectedOption);
        useProposalAccountsStore.getState().initOption(
          refreshedOptionIndex,
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
          useProposalAccountsStore
            .getState()
            .setOptionSnapshot(refreshed.selectedOption);
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

  const onStartProposalOptionCreate = React.useCallback(() => {
    if (data?.kind !== "proposal") return;
    if (!campaignIdForActions) return;

    const updateState = useUpdateCampaign.getState();
    const hasUnsavedChanges =
      Object.keys(updateState.patches ?? {}).length > 0 ||
      updateState.hasStructuralChanges;

    if (hasUnsavedChanges) {
      toast.error("Save the current option before creating another option");
      return;
    }

    const campaignName = String(data.campaignName ?? "").trim();
    const displayCurrency = data.selectedOption?.displayCurrency;

    if (!campaignName || !isCampaignDisplayCurrency(displayCurrency)) {
      toast.error("Proposal campaign context is invalid");
      return;
    }

    const builder = useCampaignBuilderStore.getState();

    builder.actions.reset();
    builder.actions.setCampaignName(campaignName);

    const currencyResult = builder.actions.switchCampaignCurrency(
      displayCurrency,
    );

    if (!currencyResult.ok) {
      builder.actions.reset();
      toast.error("Proposal currency is unavailable in Campaign Builder");
      return;
    }

    setOptionModal(false);
    navigate(
      buildProposalOptionCreateUrl("/client/create-campaign", {
        mode: PROPOSAL_OPTION_CREATE_MODE,
        campaignId: campaignIdForActions,
        returnTo: "/client/campaign",
        currency: displayCurrency,
      }),
    );
  }, [
    data,
    campaignIdForActions,
    navigate,
    setOptionModal,
  ]);

  const onCloneOption = React.useCallback(
    async () => {
      if (data?.kind !== "proposal") return;
      if (!campaignIdForActions) return;

      if (isCreatingOptionRef.current) return;

      const updateState = useUpdateCampaign.getState();
      const hasUnsavedChanges =
        Object.keys(updateState.patches ?? {}).length > 0 ||
        updateState.hasStructuralChanges;

      if (hasUnsavedChanges) {
        toast.error("Save the current option before creating another option");
        return;
      }

      isCreatingOptionRef.current = true;
      let postSucceeded = false;

      try {
        setIsRequesting(true);
        setOptionModal(false);

        const created = await useFetchCampaign
        .getState()
        .addProposalOption(campaignIdForActions, true);
        postSucceeded = true;

        if (!isValidCreatedProposalOption(created, campaignIdForActions)) {
          throw new Error("Invalid create Proposal option response");
        }

        await hydrateCreatedProposalOption(created);

        setLocalExtraOptions([]);
        setActiveOption(created.optionIndex);
        setIsRequestSent(false);

        toast.success("Proposal option added successfully!");
      } catch (e) {
        console.error(e);
        const optionMayHaveBeenCreated =
          postSucceeded ||
          e instanceof CreateProposalOptionResponseValidationError;

        toast.error(
          optionMayHaveBeenCreated
            ? "Option may have been created, but it could not be loaded. Reopen the proposal to retry"
            : "Failed to add proposal option",
        );
      } finally {
        isCreatingOptionRef.current = false;
        setIsRequesting(false);
      }
    },
    [
      data,
      campaignIdForActions,
      setLocalExtraOptions,
      setActiveOption,
      setOptionModal,
      setIsRequesting,
      setIsRequestSent,
    ],
  );

  const onDeleteOption = React.useCallback(
    async (deletedOptionIndex: number) => {
      if (data?.kind !== "proposal") return;

      const currentOptions = getOptionIndexes(data, []);

      if (currentOptions.length <= 1) {
        toast.error("You cannot delete the last option");
        return;
      }

      const nextActiveOption = getNextActiveOptionAfterDelete({
        activeOption,
        deletedOption: deletedOptionIndex,
        existingOptions: currentOptions,
      });

      if (nextActiveOption === null) {
        toast.error("Cannot safely resolve the option after deletion");
        return;
      }

      let deleteSucceeded = false;

      try {
        setIsRequesting(true);

        await deleteProposalOption(data.campaignId, deletedOptionIndex);
        deleteSucceeded = true;

        useUpdateCampaign.getState().reset();
        useProposalAccountsStore.getState().clearAll();

        setLocalExtraOptions([]);
        setActiveOption(nextActiveOption);
        setIsRequestSent(false);
        writeLastProposalOptionSession({
          campaignId: data.campaignId,
          optionIndex: nextActiveOption,
        });

        const refreshed = await reloadProposalOption(nextActiveOption);

        const authoritativeOptionIndex = refreshed?.selectedOption?.optionIndex;
        const refreshedOptions = refreshed?.existingOptions ?? [];
        const isAuthoritativeSurvivor =
          refreshed?.kind === "proposal" &&
          String(refreshed.campaignId) === String(data.campaignId) &&
          typeof authoritativeOptionIndex === "number" &&
          authoritativeOptionIndex === nextActiveOption &&
          refreshedOptions.includes(authoritativeOptionIndex);

        if (!isAuthoritativeSurvivor) {
          useProposalAccountsStore.getState().clearAll();
          useFetchCampaign.setState({ data: null });
          sessionStorage.removeItem("lastCampaign");
          toast.error(
            "Option was deleted, but the surviving option could not be loaded",
          );
          navigate("/client/dashboard");
          return;
        }

        writeLastProposalOptionSession({
          campaignId: data.campaignId,
          optionIndex: authoritativeOptionIndex,
        });

        toast.success("Proposal option deleted successfully!");
      } catch (e) {
        console.error(e);

        if (deleteSucceeded) {
          useUpdateCampaign.getState().reset();
          useProposalAccountsStore.getState().clearAll();
          useFetchCampaign.setState({ data: null });
          sessionStorage.removeItem("lastCampaign");
          toast.error(
            "Option was deleted, but the surviving option could not be loaded",
          );
          navigate("/client/dashboard");
        } else {
          toast.error("Failed to delete option");
        }
      } finally {
        setIsRequesting(false);
      }
    },
    [
      data,
      activeOption,
      setActiveOption,
      setLocalExtraOptions,
      setIsRequesting,
      setIsRequestSent,
      reloadProposalOption,
      navigate,
    ],
  );

  const updateProposalOption = React.useCallback(async () => {
    if (!data?.campaignId) return;

    let patchSucceeded = false;

    try {
      setIsRequesting(true);

      const proposalState = useProposalAccountsStore.getState();

      const accounts = proposalState.accountsByOption[activeOption] ?? [];
      const content = proposalState.contentByOption[activeOption] ?? [];
      const patches = useUpdateCampaign.getState().patches ?? {};

      const patchResult = buildProposalOptionPatchBody({
        campaignName: data.campaignName,
        snapshot: proposalState.optionSnapshotsByIndex[activeOption],
        accounts,
        content,
        patches,
        pendingBundleMembership:
          proposalState.pendingBundleMembershipByOption[activeOption],
        selectedOfferChange: Object.prototype.hasOwnProperty.call(
          proposalState.selectedOfferChangeByOption,
          activeOption,
        )
          ? proposalState.selectedOfferChangeByOption[activeOption]
          : undefined,
      });

      if (!patchResult.ok) {
        console.warn("[PROPOSAL PATCH blocked]", patchResult.code, patchResult.message);
        toast.error(patchResult.message);
        return;
      }

      await patchProposalOption(
        data.campaignId,
        activeOption,
        patchResult.body,
      );
      patchSucceeded = true;

      useUpdateCampaign.getState().reset();

      const refreshed = await reloadProposalOption(activeOption);
      if (
        refreshed?.kind !== "proposal" ||
        refreshed.selectedOption.optionIndex !== activeOption
      ) {
        throw new Error("Authoritative Proposal option refetch failed");
      }

      toast.success("Proposal campaign updated successfully!");
      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
      if (patchSucceeded) {
        useUpdateCampaign.getState().reset();
        useProposalAccountsStore.getState().clearAll();
        useFetchCampaign.setState({ data: null });
        toast.error(
          "Proposal was updated, but the authoritative option could not be reloaded",
        );
        navigate("/client/dashboard");
      } else {
        toast.error("Failed to update proposal campaign");
      }
    } finally {
      setIsRequesting(false);
    }
  }, [
    data,
    activeOption,
    setIsRequesting,
    setIsRequestSent,
    reloadProposalOption,
    navigate,
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
    onStartProposalOptionCreate,
    onCloneOption,
    onDeleteOption,
    updateProposalOption,
    updateStrategyCampaign,
    proceedDraftToPayment,
    copyShareLink,
    copyPromoShareLink,
    visibleStats,
  };
};
