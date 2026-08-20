import React from "react";
import { ButtonMain, Container, Loader } from "@/components";
import save from "@/assets/icons/check-circle.svg";

import "@/client-side/styles-table/campaignBase.scss";
import "@/client-side/styles-table/table-base.scss";

import { useCopyShareLinkMutation } from "@/client-side/react-query";
import { Bar, BarSection } from "@/client-side/ui";
import {
  useFetchCampaign,
  useProposalAccountsStore,
  useUpdateCampaign,
} from "@/client-side/store";

import { CampaignPageHeader } from "./ui/campaign-page-header";
import { CampaignPageControls } from "./ui/campaign-page-controls";
import { CampaignPageModals } from "./ui/campaign-page-modals";

import { useCampaignPageBootstrap } from "./model/use-campaign-page-bootstrap";
import { useCampaignPageView } from "./model/use-campaign-page-view";
import { useCampaignPageActions } from "./model/use-campaign-page-actions";
import { getBarComponentKind } from "./model/campaign-page.utils";
import { CampaignPageContent } from "@/client-side/widgets/campaign/campaign-page-content.tsx";
import { patchCampaign } from "@/api/client/campaign/campaign.api";
import {
  decideProposalOptionSwitchIntent,
  discardBeforeProposalOptionSwitch,
  isProposalOptionDirty,
  saveBeforeProposalOptionSwitch,
} from "./model/proposal-option-dirty";

type VisibilityState = {
  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;
};

export const CampaignPage = () => {
  const { data, isLoading } = useFetchCampaign();
  const { isPending } = useCopyShareLinkMutation();

  const [visibility, setVisibility] = React.useState<VisibilityState>({
    isCpmAndResultHidden: false,
    isPriceHidden: false,
  });

  useCampaignPageBootstrap(data);

  React.useEffect(() => {
    if (!data) return;

    setVisibility({
      isCpmAndResultHidden: Boolean(data.isCpmAndResultHidden),
      isPriceHidden: Boolean(data.isPriceHidden),
    });
  }, [data?.campaignId, data?.isCpmAndResultHidden, data?.isPriceHidden]);

  const viewState = useCampaignPageView(data);

  const {
    optionModal,
    setOptionModal,
    activeOption,
    setActiveOption,
    changeView,
    setChangeView,
    view,
    setView,
    isRequesting,
    setIsRequesting,
    isRequestSent,
    setIsRequestSent,
    isRequestingPDF,
    setIsRequestingPDF,
    setLocalExtraOptions,
    textareaValue,
    flag,
    setFlag,
  } = viewState;

  const actions = useCampaignPageActions({
    data,
    activeOption,
    setActiveOption,
    setLocalExtraOptions,
    textareaValue,
    setOptionModal,
    setIsRequesting,
    setIsRequestSent,
    setIsRequestingPDF,
  });
  const {
    onClickOption,
    updateProposalOption,
  } = actions;

  const patches = useUpdateCampaign((s) => s.patches);
  const hasStructuralChanges = useUpdateCampaign((s) => s.hasStructuralChanges);
  const proposalSnapshot = useProposalAccountsStore(
    (state) => state.optionSnapshotsByIndex[activeOption],
  );
  const proposalAccounts = useProposalAccountsStore(
    (state) => state.accountsByOption[activeOption],
  );
  const proposalContent = useProposalAccountsStore(
    (state) => state.contentByOption[activeOption],
  );
  const pendingBundleMembership = useProposalAccountsStore(
    (state) => state.pendingBundleMembershipByOption[activeOption],
  );
  const selectedOfferChanges = useProposalAccountsStore(
    (state) => state.selectedOfferChangeByOption,
  );
  const [pendingTargetOptionIndex, setPendingTargetOptionIndex] =
    React.useState<number | null>(null);
  const [isDirtySwitchSaving, setIsDirtySwitchSaving] = React.useState(false);

  const isDirty = React.useMemo(() => {
    if (data?.kind !== "proposal") {
      return Object.keys(patches ?? {}).length > 0 || hasStructuralChanges;
    }

    const hasSelectedOfferChange = Object.prototype.hasOwnProperty.call(
      selectedOfferChanges,
      activeOption,
    );

    return isProposalOptionDirty({
      snapshot: proposalSnapshot,
      accounts: proposalAccounts ?? [],
      content: proposalContent ?? [],
      patches,
      pendingBundleMembership,
      ...(hasSelectedOfferChange
        ? { selectedOfferChange: selectedOfferChanges[activeOption] }
        : {}),
    });
  }, [
    data?.kind,
    patches,
    hasStructuralChanges,
    selectedOfferChanges,
    activeOption,
    proposalSnapshot,
    proposalAccounts,
    proposalContent,
    pendingBundleMembership,
  ]);

  const closeDirtySwitchModal = React.useCallback(() => {
    if (isDirtySwitchSaving) return;
    setPendingTargetOptionIndex(null);
  }, [isDirtySwitchSaving]);

  const handleOptionIntent = React.useCallback(
    (targetOptionIndex: number) => {
      const decision = decideProposalOptionSwitchIntent({
        activeOptionIndex: activeOption,
        targetOptionIndex,
        isDirty,
      });

      if (decision.kind === "no_op") return;
      if (decision.kind === "confirm") {
        setPendingTargetOptionIndex(decision.targetOptionIndex);
        return;
      }

      void onClickOption(decision.targetOptionIndex);
    },
    [activeOption, isDirty, onClickOption],
  );

  const discardAndSwitchOption = React.useCallback(async () => {
    const targetOptionIndex = pendingTargetOptionIndex;
    if (targetOptionIndex === null || isDirtySwitchSaving) return;

    const discarded = await discardBeforeProposalOptionSwitch({
      targetOptionIndex,
      resetHistoricalState: () => useUpdateCampaign.getState().reset(),
      restoreCurrentOption: () => useProposalAccountsStore
        .getState()
        .restoreOptionFromSnapshot(activeOption),
      switchOption: async (optionIndex) => {
        setPendingTargetOptionIndex(null);
        await onClickOption(optionIndex);
      },
    });

    if (!discarded) setPendingTargetOptionIndex(null);
  }, [
    pendingTargetOptionIndex,
    isDirtySwitchSaving,
    activeOption,
    onClickOption,
  ]);

  const saveAndSwitchOption = React.useCallback(async () => {
    const targetOptionIndex = pendingTargetOptionIndex;
    if (targetOptionIndex === null || isDirtySwitchSaving) return;

    setIsDirtySwitchSaving(true);

    let switched = false;
    let modalResolvedBeforeSwitch = false;
    try {
      switched = await saveBeforeProposalOptionSwitch({
        targetOptionIndex,
        saveCurrentOption: updateProposalOption,
        switchOption: async (optionIndex) => {
          modalResolvedBeforeSwitch = true;
          setIsDirtySwitchSaving(false);
          setPendingTargetOptionIndex(null);
          await onClickOption(optionIndex);
        },
      });
    } finally {
      if (!modalResolvedBeforeSwitch) {
        setIsDirtySwitchSaving(false);
        setPendingTargetOptionIndex(null);
      }
    }

    return switched;
  }, [
    pendingTargetOptionIndex,
    isDirtySwitchSaving,
    updateProposalOption,
    onClickOption,
  ]);

  const isVisibilityDirty = React.useMemo(() => {
    if (!data) return false;

    return (
      visibility.isCpmAndResultHidden !== Boolean(data.isCpmAndResultHidden) ||
      visibility.isPriceHidden !== Boolean(data.isPriceHidden)
    );
  }, [
    data,
    visibility.isCpmAndResultHidden,
    visibility.isPriceHidden,
  ]);

  const updateVisibilityOnToggle = React.useCallback(
    async (nextVisibility: VisibilityState) => {
      if (!data?.campaignId) return;

      const prevVisibility = visibility;

      setVisibility(nextVisibility);
      setIsRequesting(true);

      try {
        await patchCampaign(data.campaignId, {
          isCpmAndResultHidden: nextVisibility.isCpmAndResultHidden,
          isPriceHidden: nextVisibility.isPriceHidden,
        });

        const refreshed = await useFetchCampaign
        .getState()
        .setCampaign(data.campaignId);

        const fresh = refreshed ?? useFetchCampaign.getState().data;

        if (fresh) {
          setVisibility({
            isCpmAndResultHidden: Boolean(fresh.isCpmAndResultHidden),
            isPriceHidden: Boolean(fresh.isPriceHidden),
          });
        }

        setIsRequestSent(true);
      } catch (e) {
        console.error(e);
        setVisibility(prevVisibility);
      } finally {
        setIsRequesting(false);
      }
    },
    [
      data?.campaignId,
      visibility,
      setIsRequesting,
      setIsRequestSent,
    ],
  );

  React.useEffect(() => {
    if (isDirty || isVisibilityDirty) {
      setIsRequestSent(false);
    }
  }, [isDirty, isVisibilityDirty, setIsRequestSent]);

  if (!data || isLoading) {
    return <Loader/>;
  }

  const { isBarSection, showBar } = getBarComponentKind(data);

  const BarComponent =
    data?.kind === "regular"
      ? isBarSection
        ? BarSection
        : Bar
      : data?.kind === "proposal" || data?.kind === "draft"
        ? Bar
        : null;

  const isProposal = data?.status === "proposal";

  const campaignWithVisibility = {
    ...data,
    isCpmAndResultHidden: visibility.isCpmAndResultHidden,
    isPriceHidden: visibility.isPriceHidden,
  };

  const headerAction = (() => {
    if (data.kind === "proposal") {
      if (data?.selectedOption?.canEdit) {
        return (
          <button
            className={`campaignBase__title-request save ${
              isDirty ? "saveActive" : "saveDisabled"
            }`}
            disabled={!isDirty || isRequesting}
            onClick={actions.updateProposalOption}
          >
            <img src={save} alt=""/>
            {isRequestSent ? "Saved" : isRequesting ? "Saving..." : "Save"}
          </button>
        );
      }

      return null;
    }

    if (data.kind === "regular") {
      return null;
    }

    return null;
  })();

  return (
    <>
      <Container className="campaignBase">
        <CampaignPageHeader
          title={`${data.campaignName} - Campaign SoundInfluencers`}
          rightSlot={headerAction}
        />

        {showBar && BarComponent && (
          isBarSection ? (
            <BarSection
              campaign={{
                ...data,
                isCpmAndResultHidden: visibility.isCpmAndResultHidden,
                isPriceHidden: visibility.isPriceHidden,
              }}
              visibleStats={actions.visibleStats}
              canToggleVisibility={true}
              onVisibilityChange={updateVisibilityOnToggle}
            />
          ) : (
            <BarComponent visibleStats={actions.visibleStats} campaign={data}/>
          )
        )}

        <div className="campaignBase__content">
          <CampaignPageControls
            data={data}
            isProposal={isProposal}
            view={view}
            setView={setView}
            changeView={changeView}
            setChangeView={setChangeView}
            flag={flag}
            setFlag={setFlag}
            optionIndexes={actions.optionIndexes}
            activeOption={activeOption}
            onClickOption={handleOptionIntent}
            onDeleteOption={actions.onDeleteOption}
            onOpenOptionModal={() => setOptionModal(true)}
            onCopyShareLink={() => {
              if (data.status === "completed" || data.kind === "regular") {
                actions.copyShareLink();
                return;
              }

              actions.copyPromoShareLink();
            }}
            onGetCSV={() => actions.getCSV(data.campaignId)}
            onGetPDF={() => actions.getPDF(data.campaignId)}
            isPending={isPending}
            isRequesting={isRequesting}
            isRequestingPDF={isRequestingPDF}
          />

          <CampaignPageContent
            data={data}
            changeView={changeView}
            view={view}
            flag={flag}
            proposalOptionIndexes={actions.optionIndexes}
            onDeleteProposalOption={actions.onDeleteOption}
            isProposalMutationPending={isRequesting}
          />
        </div>

        {data.kind === "proposal" && (
          <p className="option-chose">
            Option {activeOption + 1} is already selected
          </p>
        )}

        {data.kind === "draft" && (
          <div className="campaignBase__proceedTo">
            <ButtonMain
              className="proceedTo"
              text="Proceed to payment"
              onClick={actions.proceedDraftToPayment}
            />
          </div>
        )}
      </Container>

      <CampaignPageModals
        optionModal={optionModal}
        activeOption={activeOption}
        onCloseOptionModal={() => setOptionModal(false)}
        onAddOptionNo={actions.onStartProposalOptionCreate}
        onAddOptionYes={actions.onCloneOption}
        isPending={isRequesting}
        isDirtySwitchModalOpen={pendingTargetOptionIndex !== null}
        isDirtySwitchSaving={isDirtySwitchSaving}
        onCloseDirtySwitchModal={closeDirtySwitchModal}
        onSaveDirtySwitch={saveAndSwitchOption}
        onDiscardDirtySwitch={discardAndSwitchOption}
      />
    </>
  );
};
