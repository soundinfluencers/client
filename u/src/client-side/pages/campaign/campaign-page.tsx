import React from "react";

import {
  Breadcrumbs,
  ButtonMain,
  ButtonSecondary,
  Checkbox,
  Container,
  Loader,
} from "@/components";

import { Modal } from "@/components/ui/modal-fix/Modal";

import {
  deleteProposalOption,
  patchAddProposalOption,
  patchCampaign,
  postCampaignRequest,
} from "@/api/client/campaign/campaign.api";

import csv from "@/assets/icons/iwwa_file-csv.svg";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import share from "@/assets/icons/mdi-light_share.svg";
import link from "@/assets/icons/link (1).svg";

import "@/client-side/styles-table/campaignBase.scss";
import "@/client-side/styles-table/table-base.scss";
import { useCopyShareLinkMutation } from "@/client-side/react-query";
import {
  AddinitonalOption,
  Bar,
  BarSection,
  ToggleTables,
  ViewAudience,
  ViewChange,
} from "@/client-side/ui";
import { CampaignTablePage, ProposalCampaignPage } from "@/client-side/widgets";
import {
  useDraftCampaignStore,
  useFetchCampaign,
  useProposalAccountsStore,
  useStrategyCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { buildProposalPatchBody, downloadBlob } from "@/client-side/utils";

import { getPdfFile } from "@/api/client/file/get-pdf";
import { getCsvFile } from "@/api/client/file/get-csv";
import { CampaignTablePageDraft } from "@/client-side/widgets/campaign/table-pages/campaign-page-draft";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { OptionsSlider } from "@/client-side/widgets/campaign/components/option-slider";

export const CampaignPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, setProposalOption, addProposalOption } =
    useFetchCampaign();

  React.useEffect(() => {
    const raw = sessionStorage.getItem("lastCampaign");
    if (!raw) {
      navigate("/client/dashboard");
      return;
    }

    const { id, status, optionIndex } = JSON.parse(raw) as {
      id: string;
      status: "draft" | "proposal" | "regular" | string;
      optionIndex?: number;
    };

    const currentId = data?.kind === "draft" ? data?.draftId : data?.campaignId;

    if (!data || currentId !== id) {
      if (status === "draft") {
        useFetchCampaign.getState().setDraft(id);
        return;
      }

      if (status === "proposal") {
        useFetchCampaign.getState().setProposalOption(id, optionIndex ?? 0);
        return;
      }

      useFetchCampaign.getState().setCampaign(id);
    }
  }, [data, navigate]);
  const [optionModal, setOptionModal] = React.useState(false);
  const [requestModal, setRequestModal] = React.useState(false);
  const [activeOption, setActiveOption] = React.useState(0);
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(1);
  const [checked, setChecked] = React.useState(true);
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [isRequestSent, setIsRequestSent] = React.useState(false);
  const [isRequestingPDF, setisRequestingPDF] = React.useState(false);
  const [isRequestSentPDF, setIsRequestSentPDF] = React.useState(false);
  const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>(
    [],
  );
  const [textaretValue, setTextareaValue] = React.useState("");
  const [flag, setFlag] = React.useState(true);
  console.log(data, "data");
  const patches = useUpdateCampaign((s) => s.patches);
  const isDirty = React.useMemo(
    () => Object.keys(patches ?? {}).length > 0,
    [patches],
  );
  const isBarSection =
    data?.kind === "regular" &&
    ["distributing", "completed"].includes(data.status);
  const BarComponent =
    data?.kind === "regular"
      ? isBarSection
        ? BarSection
        : Bar
      : data?.kind === "proposal" || data?.kind === "draft"
        ? Bar
        : null;
  const { mutate: copyShareLink, isPending } = useCopyShareLinkMutation();
  const initOption = useProposalAccountsStore((s) => s.initOption);
  const initCampaign = useStrategyCampaignStore((s) => s.initCampaign);
  const initDraft = useDraftCampaignStore((s) => s.initCampaign);

  const campaignIdForActions =
    data?.kind === "draft" ? data?.draftId : data?.campaignId;

  const isProposal = data?.status === "proposal";
  const optionIndexes =
    data?.kind === "proposal"
      ? Array.from(
          new Set([...(data.existingOptions ?? []), ...localExtraOptions]),
        ).sort((a, b) => a - b)
      : [];

  const getCSV = async (id: string) => {
    try {
      setIsRequesting(true);
      const res = await getCsvFile(id);

      const blob = res.data as Blob;

      downloadBlob(blob, `campaign-${id}.csv`);
    } catch (error) {
      console.log(error);
    } finally {
      toast.success("CSV created succesfully!");
      setIsRequesting(false);
    }
  };
  const getPDF = async (id: string) => {
    try {
      setIsRequestSentPDF(true);
      const res = await getPdfFile(id);

      const blob = res.data as Blob;

      downloadBlob(blob, `campaign-${id}.pdf`);
    } catch (error) {
      console.log(error);
    } finally {
      toast.success("PDF created succesfully!");
      setIsRequestSentPDF(false);
    }
  };

  React.useEffect(() => {
    if (isDirty) setIsRequestSent(false);
  }, [isDirty]);
  React.useEffect(() => {
    if (data?.kind === "proposal") {
      const idx = data.selectedOption.optionIndex ?? 0;
      setActiveOption(idx);

      initOption(
        idx,
        data.selectedOption.addedAccounts,
        data.selectedOption.campaignContent,
      );
    }
  }, [
    data?.kind,
    data?.kind === "proposal" ? data.selectedOption?.optionIndex : null,
  ]);
  React.useEffect(() => {
    if (data?.kind === "proposal") {
      setView(-1);
    }
  }, [data?.kind]);
  React.useEffect(() => {
    if (data?.kind === "regular") {
      initCampaign(data.campaignId, data.addedAccounts, data.campaignContent);
    }
  }, [data?.kind, data?.kind === "regular" ? data.campaignContent : null]);
  React.useEffect(() => {
    if (data?.kind === "draft") {
      initDraft(
        data.draftId,
        data.addedAccountsDraft ?? [],
        data.campaignContentDraft ?? [],
      );
    }
  }, [data?.kind, data?.kind === "draft" ? data.campaignContentDraft : null]);

  if (!data || isLoading) {
    return <Loader />;
  }

  const onClickOption = (optionIndex: number) => {
    setIsRequestSent(false);
    setActiveOption(optionIndex);
    setProposalOption(campaignIdForActions ?? "", optionIndex);
  };

  const onAddOption = async (inheritFromOption0: boolean) => {
    if (data.kind !== "proposal") return;

    const base = data.existingOptions ?? [];
    const all = [...base, ...localExtraOptions];
    const newIndex = all.length ? Math.max(...all) + 1 : 0;

    setLocalExtraOptions((prev) => [...prev, newIndex]);
    setOptionModal(false);

    try {
      setIsRequesting(true);
      await addProposalOption(campaignIdForActions ?? "", inheritFromOption0);
      toast.success("Proposal Option added succesfully!");
    } catch (e) {
      console.error(e);
      setLocalExtraOptions((prev) => prev.filter((x) => x !== newIndex));
    } finally {
      setIsRequesting(false);
    }
  };
  const onDeleteOption = async (idx: number) => {
    if (data.kind !== "proposal") return;

    try {
      setIsRequesting(true);
      await deleteProposalOption(data.campaignId, idx);

      await useFetchCampaign
        .getState()
        .setProposalOption(data.campaignId, activeOption);

      toast.success("Proposal option deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete option");
    } finally {
      setIsRequesting(false);
    }
  };
  // const onDeleteOption = async (idx: number) => {
  //   if (data.kind !== "proposal") return;

  //   setLocalExtraOptions((prev) => prev.filter((x) => x !== idx));

  //   const nextOptionIndexes = optionIndexes.filter((x) => x !== idx);
  //   if (activeOption === idx) {
  //     const next = nextOptionIndexes.length ? nextOptionIndexes[0] : 0;
  //     setActiveOption(next);
  //     setProposalOption(campaignIdForActions ?? "", next);
  //   }

  //   try {
  //     setIsRequesting(true);

  //     await deleteProposalOption(data.campaignId, idx);

  //     toast.success("Proposal option deleted succesfully!");
  //   } catch (e) {
  //     console.error(e);
  //     toast.error("Failed to delete option");
  //   } finally {
  //     setIsRequesting(false);
  //   }
  // };
  const requestCampaign = async (campaignId: string, textaretValue: string) => {
    try {
      setIsRequesting(true);
      await postCampaignRequest(campaignId, textaretValue);
      toast.success("Request Campaign sent succesfully!");
      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };

  const updateProposalOption = async (
    campaignId: string,
    optionIndex: number,
    campaignName: string,
  ) => {
    setIsRequesting(true);

    try {
      const st = useProposalAccountsStore.getState();
      const accounts = st.accountsByOption[optionIndex] ?? [];
      const content = st.contentByOption[optionIndex] ?? [];

      const patches = useUpdateCampaign.getState().patches ?? {};

      const body = buildProposalPatchBody({
        campaignName,
        accounts,
        content,
        patches,
      });
      console.log(body, "body");
      await patchAddProposalOption(campaignId, optionIndex, body);

      useUpdateCampaign.getState().reset();

      await useFetchCampaign
        .getState()
        .setProposalOption(campaignId, optionIndex);
      toast.success("Proposal Campaign updated succesfully!");

      const fresh = useFetchCampaign.getState().data;
      if (fresh?.kind === "proposal") {
        useProposalAccountsStore
          .getState()
          .initOption(
            optionIndex,
            fresh.selectedOption.addedAccounts,
            fresh.selectedOption.campaignContent,
            { force: true },
          );
      }

      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };
  const updateStrategyCampaign = async (
    campaignId: string,
    campaignName: string,
  ) => {
    try {
      setIsRequesting(true);

      const strategyState = useStrategyCampaignStore.getState();

      const accounts = strategyState.accountsByCampaignId[campaignId] ?? [];

      const content = strategyState.contentByCampaignId[campaignId] ?? [];

      const patches = useUpdateCampaign.getState().patches ?? {};

      const body = buildProposalPatchBody({
        campaignName,
        accounts,
        content,
        patches,
      });
      console.log(body, "body");
      await patchCampaign(campaignId, body);

      useUpdateCampaign.getState().reset();
      await useFetchCampaign.getState().setCampaign(campaignId);
      toast.success("Strategy Campaign updated succesfully!");
      const fresh = useFetchCampaign.getState().data;
      if (fresh?.kind === "regular") {
        useStrategyCampaignStore
          .getState()
          .initCampaign(
            fresh.campaignId,
            fresh.addedAccounts,
            fresh.campaignContent,
            {
              force: true,
            },
          );
      }
      setIsRequestSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };
  const proceedDraftToPayment = async (draft: any) => {
    const draftId = String(draft?.draftId ?? "");
    if (!draftId) return;

    const draftState = useDraftCampaignStore.getState();
    const accounts = draftState.accountsByCampaignId[draftId] ?? [];
    const content = draftState.contentByCampaignId[draftId] ?? [];
    const patches = useUpdateCampaign.getState().patches ?? {};

    const body = buildProposalPatchBody({
      campaignName: draft.campaignName,
      accounts,
      content,
      patches,
    });

    useDraftCampaignStore.getState().setDraftPayload(draftId, body);

    navigate(`/client/campaign/payment?draft=${draftId}`);
  };
  const buildPromoShareUrl = (campaignIdProposalId: string) => {
    const origin = "https://test.soundinfluencers.com/"; // https://your-domain.com
    const id = encodeURIComponent(campaignIdProposalId);

    return `${origin}/promo-share/${id}/proposal`;
  };
  const copyPromoShareLink = async (campaignIdProposalId: string) => {
    const url = buildPromoShareUrl(campaignIdProposalId);
    console.log(url, "url");
    console.log(campaignIdProposalId, "campaignIdProposalId");

    await navigator.clipboard.writeText(url);
  };
  const isLockedStatus =
    data.status === "distributing" || data.status === "completed";
  return (
    <>
      <Container className="campaignBase">
        <div className="navmenu">
          <Breadcrumbs />
        </div>

        <div className="campaignBase__title">
          <h1>{data.campaignName} - Campaign SoundInfluencers</h1>
        </div>
        {BarComponent && <BarComponent campaign={data} />}

        <div className="campaignBase__content">
          {isProposal ? (
            <>
              <div className="controls">
                {view === -1 && (
                  <AddinitonalOption onClick={() => setOptionModal(true)} />
                )}
                <OptionsSlider
                  optionIndexes={optionIndexes}
                  activeOption={activeOption}
                  onClickOption={onClickOption}
                  onDeleteOption={onDeleteOption}
                />{" "}
              </div>
              <div className="controls-second">
                <ViewAudience
                  flag={changeView}
                  onChange={() => setChangeView((prev) => !prev)}
                />
                <div className="controls-second__content">
                  <ViewChange
                    isProposal={isProposal}
                    setView={setView}
                    view={view}
                  />
                  <div className="share-link-row-proposal">
                    <div
                      onClick={() => {
                        copyPromoShareLink(campaignIdForActions ?? "");
                        toast.success("Shared link created succesfully!");
                      }}
                      className="share-link-proposal">
                      <img src={link} alt="" />
                      {isPending ? "Copying..." : "Share link"}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="controls">
                {view === -1 && (
                  <AddinitonalOption onClick={() => setOptionModal(true)} />
                )}
                <ul className="option-list">
                  {optionIndexes.map((idx) => (
                    <li
                      key={idx}
                      className={activeOption === idx ? "active-option" : ""}
                      onClick={() => onClickOption(idx)}>
                      Option {idx + 1}
                    </li>
                  ))}
                </ul>
                {view !== 1 && (
                  <div className="ViewAudience-block">
                    <ViewAudience
                      flag={changeView}
                      onChange={() => setChangeView((prev) => !prev)}
                    />
                  </div>
                )}
              </div> */}
            </>
          ) : (
            <div className="controls">
              <ToggleTables
                onChange={() => setFlag((prev) => !prev)}
                flag={flag}
              />
              <ViewChange
                isProposal={isProposal}
                setView={setView}
                view={view}
              />
              {data.status === "completed" ? (
                <ul className="option-buttons">
                  <li onClick={() => getCSV(data.campaignId)}>
                    <img src={csv} alt="" />
                    {isRequestSent
                      ? "CSV File"
                      : isRequesting
                        ? "creating..."
                        : "CSV File"}
                  </li>
                  <li onClick={() => getPDF(data.campaignId)}>
                    <img src={pdf} alt="" />{" "}
                    {isRequestSentPDF
                      ? "PDF File"
                      : isRequestSentPDF
                        ? "creating..."
                        : "PDF File"}
                  </li>
                  <li
                    onClick={() => {
                      copyShareLink(campaignIdForActions ?? "");
                      toast.success("Shared link created succesfully!");
                    }}>
                    <img src={share} alt="" />
                    {isPending ? "Copying..." : "Share"}
                  </li>
                </ul>
              ) : (
                data.kind === "regular" && (
                  <div className="share-link-row">
                    <div
                      onClick={() => {
                        copyShareLink(campaignIdForActions ?? "");
                        toast.success("Shared link created succesfully!");
                      }}
                      className="share-link">
                      <img src={link} alt="" />
                      {isPending ? "Copying..." : "Share link"}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          {data.kind !== "proposal" && data.kind !== "regular" && (
            <div className="ViewAudience-block">
              <ViewAudience
                flag={changeView}
                onChange={() => setChangeView((prev) => !prev)}
              />
            </div>
          )}
          {data.kind === "proposal" ? (
            <ProposalCampaignPage
              campaign={data}
              changeView={changeView}
              view={view}
            />
          ) : data.kind === "regular" ? (
            <CampaignTablePage
              view={view}
              statusFlag={["distributing", "completed"].includes(data.status)}
              campaign={data}
              flag={flag}
            />
          ) : (
            data.kind === "draft" && (
              <CampaignTablePageDraft
                changeView={changeView}
                view={view}
                campaign={data}
              />
            )
          )}
        </div>

        {/* <Checkbox
          name="Allow automatic influencer replacement if a creator opts out."
          isChecked={checked}
          onChange={setChecked}
        /> */}
        {data.kind === "proposal" && (
          <p className="option-chose">
            Option {activeOption + 1} is already selected
          </p>
        )}
        {/* <div className="campaignBase__proceedTo">
          {data.kind === "proposal" ? (
            data?.selectedOption?.canEdit ? (
              <ButtonSecondary
                className="proceedTo"
                text={
                  isRequestSent
                    ? "Updated"
                    : isRequesting
                      ? "Updating..."
                      : "Update"
                }
                onClick={() =>
                  updateProposalOption(
                    data.campaignId,
                    activeOption,
                    data.campaignName,
                  )
                }
              />
            ) : (
              <ButtonSecondary
                className="proceedTo"
                text={
                  isRequestSent
                    ? "Sent"
                    : isRequesting
                      ? "Sending..."
                      : "Request edit"
                }
                onClick={() => setRequestModal(true)}
                // onClick={() => requestCampaign(campaignIdForActions ?? "")}
              />
            )
          ) : data.canEdit ? (
            <ButtonSecondary
              text={
                isRequesting
                  ? "Updating..."
                  : isRequestSent
                    ? "Updated"
                    : "Update"
              }
              isDisabled={!isDirty || isRequesting}
              onClick={() =>
                updateStrategyCampaign(data.campaignId, data.campaignName)
              }
            />
          ) : data.kind === "draft" ? (
            <ButtonMain
              className="proceedTo"
              text={"Proceed to payment"}
              onClick={() => proceedDraftToPayment(data)}
            />
          ) : (
            <ButtonSecondary
              className="proceedTo"
              text={
                isRequestSent
                  ? "Sent"
                  : isRequesting
                    ? "Sending..."
                    : "Request edit"
              }
              onClick={() => setRequestModal(true)}
              // onClick={() => requestCampaign(campaignIdForActions ?? "")}
            />
          )}
        </div> */}
        <div className="campaignBase__proceedTo">
          {data.kind === "proposal" ? (
            data?.selectedOption?.canEdit ? (
              <ButtonSecondary
                className="proceedTo"
                text={
                  isRequestSent
                    ? "Updated"
                    : isRequesting
                      ? "Updating..."
                      : "Update"
                }
                onClick={() =>
                  updateProposalOption(
                    data.campaignId,
                    activeOption,
                    data.campaignName,
                  )
                }
              />
            ) : !isLockedStatus ? (
              <ButtonSecondary
                className="proceedTo"
                text={
                  isRequestSent
                    ? "Sent"
                    : isRequesting
                      ? "Sending..."
                      : "Request edit"
                }
                onClick={() => setRequestModal(true)}
              />
            ) : null
          ) : data.canEdit ? (
            <ButtonSecondary
              text={
                isRequesting
                  ? "Updating..."
                  : isRequestSent
                    ? "Updated"
                    : "Update"
              }
              isDisabled={!isDirty || isRequesting}
              onClick={() =>
                updateStrategyCampaign(data.campaignId, data.campaignName)
              }
            />
          ) : data.kind === "draft" ? (
            <ButtonMain
              className="proceedTo"
              text="Proceed to payment"
              onClick={() => proceedDraftToPayment(data)}
            />
          ) : !isLockedStatus ? (
            <ButtonSecondary
              className="proceedTo"
              text={
                isRequestSent
                  ? "Sent"
                  : isRequesting
                    ? "Sending..."
                    : "Request edit"
              }
              onClick={() => setRequestModal(true)}
            />
          ) : null}
        </div>
      </Container>
      {optionModal && (
        <Modal onClose={() => setOptionModal(false)}>
          <div className="create-option">
            <h2>Proposal option</h2>
            <p>
              Do you want to include the current Pages & Content from Option 1?
            </p>
            <div className="create-option-btn">
              <ButtonSecondary
                className="btn"
                text="No"
                onClick={() => onAddOption(false)}
              />
              <ButtonMain
                className="btn"
                text="Yes"
                onClick={() => onAddOption(true)}
              />
            </div>
          </div>
        </Modal>
      )}{" "}
      {requestModal && (
        <Modal onClose={() => setRequestModal(false)}>
          <div className="request-edit">
            <h2>Request edit</h2>
            <textarea
              value={textaretValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="Enter your edit text"
            />
            <ButtonMain
              className="btn"
              text={"Send"}
              onClick={() =>
                requestCampaign(campaignIdForActions ?? "", textaretValue)
              }
            />
          </div>
        </Modal>
      )}
    </>
  );
};
