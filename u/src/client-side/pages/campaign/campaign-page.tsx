import React from "react";
import { ButtonMain, Container, Loader } from "@/components";
import { toast } from "react-toastify";

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
import {buildShareUrl, getBarComponentKind} from "./model/campaign-page.utils";
import {CampaignPageContent} from "@/client-side/widgets/campaign/campaign-page-content.tsx";

export const CampaignPage = () => {
  const { data, isLoading } = useFetchCampaign();
  const { mutate: copyShareLink, isPending } = useCopyShareLinkMutation();
  const patches = useUpdateCampaign((s) => s.patches);

  useCampaignPageBootstrap(data);

  const viewState = useCampaignPageView(data);

  const {
    optionModal,
    setOptionModal,
    requestModal,
    setRequestModal,
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
    setTextareaValue,
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
    setRequestModal,
    setOptionModal,
    setIsRequesting,
    setIsRequestSent,
    setIsRequestingPDF,
  });

  const isDirty = React.useMemo(
      () => Object.keys(patches ?? {}).length > 0,
      [patches],
  );

  React.useEffect(() => {
    if (isDirty) setIsRequestSent(false);
  }, [isDirty, setIsRequestSent]);

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

  const headerAction = (() => {
    if (data.kind === "proposal") {
      if (data?.selectedOption?.canEdit) {
        return (
            <button
                className="campaignBase__title-request"
                disabled={isRequesting}
                onClick={actions.updateProposalOption}
            >
              {isRequestSent ? "Save" : isRequesting ? "Saving..." : "Save"}
            </button>
        );
      }

      if (data.status === "under_review") {
        return (
            <button
                className="campaignBase__title-request"
                disabled={isRequesting}
                onClick={() => setRequestModal(true)}
            >
              {isRequestSent ? "Sent" : isRequesting ? "Sending..." : "Request edit"}
            </button>
        );
      }

      return null;
    }

    if (data.canEdit) {
      return (
          <button  className="campaignBase__title-request"
              disabled={!isDirty || isRequesting}
              onClick={actions.updateStrategyCampaign}
          >
            {isRequestSent ? "Saved" : isRequesting ? "Saving..." : "Save"}
          </button>
      );
    }

    if (data.status === "under_review") {
      return (
          <button
              className="campaignBase__title-request"
              disabled={isRequesting}
              onClick={() => setRequestModal(true)}
          >
            {isRequestSent ? "Sent" : isRequesting ? "Sending..." : "Request edit"}
          </button>
      );
    }

    return null;
  })();
  console.log(data,'data')
  return (
      <>
        <Container className="campaignBase">
          <CampaignPageHeader
              title={`${data.campaignName} - Campaign SoundInfluencers`}
              rightSlot={headerAction}
          />

          {showBar && BarComponent && <BarComponent campaign={data} />}

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

                    actions.copyShareLink()
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
            requestModal={requestModal}
            activeOption={activeOption}
            textareaValue={textareaValue}
            setTextareaValue={setTextareaValue}
            onCloseOptionModal={() => setOptionModal(false)}
            onCloseRequestModal={() => setRequestModal(false)}
            onAddOptionYes={() => actions.onAddOption(true)}
            onRequestSend={actions.requestCampaign}
        />
      </>
  );
};