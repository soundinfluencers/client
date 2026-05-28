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

  const patches = useUpdateCampaign((s) => s.patches);
  const hasStructuralChanges = useUpdateCampaign((s) => s.hasStructuralChanges);

  const isDirty = React.useMemo(() => {
    return Object.keys(patches ?? {}).length > 0 || hasStructuralChanges;
  }, [patches, hasStructuralChanges]);

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
    return <Loader />;
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
              <img src={save} alt="" />
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
                      canToggleVisibility={true}
                      onVisibilityChange={updateVisibilityOnToggle}
                  />
              ) : (
                  <BarComponent campaign={data} />
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
                onClickOption={actions.onClickOption}
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
            onAddOptionYes={() => actions.onAddOption(true)}
        />
      </>
  );
};