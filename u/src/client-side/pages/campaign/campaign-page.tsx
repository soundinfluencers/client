import { proposalOptionDirty } from "@/client-side/utils/proposal-option-patch";
import { ProposalActionsContext } from "./model/proposal-actions-context";
import { useProposalAccountsStore } from "@/client-side/store";
import React from "react";
import { ButtonMain, Container, Loader } from "@/components";
import save from "@/assets/icons/check-circle.svg";

import "@/client-side/styles-table/campaignBase.scss";
import "@/client-side/styles-table/table-base.scss";

import { useCopyShareLinkMutation } from "@/client-side/react-query";
import { Bar, BarSection } from "@/client-side/ui";
import { useFetchCampaign, useUpdateCampaign } from "@/client-side/store";

import { CampaignPageHeader } from "./ui/campaign-page-header";
import { CampaignPageControls } from "./ui/campaign-page-controls";
import { CampaignPageModals } from "./ui/campaign-page-modals";

import { useCampaignPageBootstrap } from "./model/use-campaign-page-bootstrap";
import { useCampaignPageView } from "./model/use-campaign-page-view";
import { useCampaignPageActions } from "./model/use-campaign-page-actions";
import { getBarComponentKind } from "./model/campaign-page.utils";
import { CampaignPageContent } from "@/client-side/widgets/campaign/campaign-page-content.tsx";
import { patchCampaign } from "@/api/client/campaign/campaign.api";

type VisibilityState = {
  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;
};

export const CampaignPage = () => {
  const { data: fetchedData, isLoading } = useFetchCampaign();
  const { isPending } = useCopyShareLinkMutation();

  const [visibility, setVisibility] = React.useState<VisibilityState>({
    isCpmAndResultHidden: false,
    isPriceHidden: false,
  });

  const data = useCampaignPageBootstrap(fetchedData);

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
    localExtraOptions,
    setLocalExtraOptions,
    textareaValue,
    flag,
    setFlag,
  } = viewState;

  const actions = useCampaignPageActions({
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
  });

  const [pendingCreate, setPendingCreate] = React.useState<"clone" | "new" | null>(null);
  const [pendingSwitch, setPendingSwitch] = React.useState<number | null>(null);
  const [switchSaving, setSwitchSaving] = React.useState(false);
  const switchLock = React.useRef(false);
  const proposalState = useProposalAccountsStore((state) => state);
  const patches = useUpdateCampaign((s) => s.patches);
  const hasStructuralChanges = useUpdateCampaign((s) => s.hasStructuralChanges);

  const isDirty = React.useMemo(() => {
    if (data?.kind === 'proposal') return proposalOptionDirty(proposalState.optionSnapshotsByIndex[activeOption],
      proposalState.accountsByOption[activeOption] ?? [], proposalState.contentByOption[activeOption] ?? [], patches ?? {},
      proposalState.selectedOfferChangeByOption[activeOption]);
    return Object.keys(patches ?? {}).length > 0 || hasStructuralChanges;
  }, [patches, hasStructuralChanges, proposalState, activeOption, data?.kind]);

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

  const optionIntent = (index: number) => {
    if (isRequesting || actions.needsProposalRead || index === activeOption) return;
    if (isDirty) setPendingSwitch(index); else void actions.onClickOption(index);
  };
  const requestDeleteOption = (index: number): Promise<boolean> => {
    if (isRequesting || actions.needsProposalRead) return Promise.resolve(false);
    return actions.onDeleteOption(index);
  };
  const recoverProposalRead = () => actions.retryProposalRead();
  const createIntent = async (kind: "clone" | "new") => {
    if (isRequesting || actions.needsProposalRead || actions.optionCreateBlocked) return;
    if (isDirty) { setPendingCreate(kind); return; }
    if (kind === 'clone') await actions.onAddOption(true); else actions.onStartProposalOptionCreate();
  };
  const closeDirtyModal = () => {
    if (switchSaving || switchLock.current) return;
    setPendingSwitch(null); setPendingCreate(null);
  };
  const resolveSwitch = async (save: boolean) => {
    if ((pendingSwitch === null && pendingCreate === null) || switchLock.current) return;
    switchLock.current = true; setSwitchSaving(true);
    const creating = pendingCreate;
    const target = pendingSwitch;
    try {
      if (creating !== null) {
        if (data?.kind !== 'proposal' || useFetchCampaign.getState().requestKey !== `proposal:${data.campaignId}:${activeOption}`) return;
        if (save) { if (actions.needsProposalRead ? !await actions.retryProposalRead() : isDirty && !await actions.updateProposalOption()) return; }
        else { if (!useProposalAccountsStore.getState().restoreOptionFromSnapshot(activeOption)) return; useUpdateCampaign.getState().reset(); }
        setPendingCreate(null);
        if (creating === 'clone') await actions.onAddOption(true); else actions.onStartProposalOptionCreate();
        return;
      }
      if (save) { if (actions.needsProposalRead ? !await actions.retryProposalRead() : isDirty && !await actions.updateProposalOption()) return; }
      else { if (!useProposalAccountsStore.getState().restoreOptionFromSnapshot(activeOption)) return; useUpdateCampaign.getState().reset(); }
      setPendingSwitch(null); await actions.onClickOption(target!);
    } finally { switchLock.current = false; setSwitchSaving(false); }
  };
  const modalCampaign = React.useRef(data?.campaignId);
  React.useEffect(() => {
    if (data?.campaignId && modalCampaign.current !== data.campaignId) {
      modalCampaign.current = data.campaignId; setPendingSwitch(null); setPendingCreate(null);
    }
  }, [data?.campaignId]);
  const uncertainDeletion = actions.getPendingProposalWrite()?.uncertain;
  if (!data || isLoading) {
    return actions.optionCreateBlocked ? <div role="alert">The option may already exist. Reopen the Proposal from the dashboard before creating another option.</div> : actions.needsProposalRead ? <div role="alert">{isLoading && !uncertainDeletion && <Loader/>}{uncertainDeletion ? <>Deletion outcome is unknown. Do not repeat deletion. <a href="/client">Review dashboard</a></> : <>The write succeeded. Reload the saved option before continuing.<button disabled={isRequesting} onClick={recoverProposalRead}>Retry reading option</button></>}</div> : <Loader/>;
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

  // const campaignWithVisibility = {
  //   ...data,
  //   isCpmAndResultHidden: visibility.isCpmAndResultHidden,
  //   isPriceHidden: visibility.isPriceHidden,
  // };

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
    <ProposalActionsContext.Provider value={{ onDeleteOption: requestDeleteOption, onAddInfluencer: actions.onAddInfluencer, isMutationPending: isRequesting || actions.needsProposalRead || actions.optionCreateBlocked }}>
      {actions.optionCreateBlocked && <p role="alert">The option may already exist. Reopen the Proposal from the dashboard; do not submit again.</p>}
      {actions.needsProposalRead && <p role="alert">{uncertainDeletion ? <>Deletion outcome is unknown. Do not repeat deletion. <a href="/client">Review dashboard</a></> : <>Write succeeded; synchronization is incomplete. <button disabled={isRequesting} onClick={recoverProposalRead}>Retry reading option</button></>}</p>}
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
            onClickOption={optionIntent}
            onDeleteOption={requestDeleteOption}
            onOpenOptionModal={() => { if (!isRequesting && !actions.needsProposalRead && actions.beginOptionCreate()) setOptionModal(true); }}
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

          {data.kind === "proposal" && isRequesting && !actions.needsProposalRead && <Loader/>}
          <div inert={isRequesting || actions.needsProposalRead || actions.optionCreateBlocked}><CampaignPageContent
            data={data}
            changeView={changeView}
            view={view}
            flag={flag}
          /></div>
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
        onAddOptionYes={() => createIntent("clone")}
        onAddOptionNo={() => createIntent("new")}
        isOptionPending={isRequesting || actions.needsProposalRead || actions.optionCreateBlocked}
        isDirtySwitchModalOpen={pendingSwitch !== null || pendingCreate !== null}
        dirtyMessage={pendingCreate !== null ? "Save changes to the source option before creating another option, or leave without saving?" : undefined}
        isDirtySwitchSaving={switchSaving}
        onCloseDirtySwitchModal={closeDirtyModal}
        onSaveDirtySwitch={() => resolveSwitch(true)}
        onDiscardDirtySwitch={() => resolveSwitch(false)}
      />
    </ProposalActionsContext.Provider>
  );
};
