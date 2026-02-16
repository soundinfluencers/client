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
import { AddinitonalOption, ViewAudience, ViewChange } from "@/client-side/ui";
import { CampaignTablePage, ProposalCampaignPage } from "@/client-side/widgets";
import {
  useFetchCampaign,
  useProposalAccountsStore,
  useStrategyCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { buildProposalPatchBody, downloadBlob } from "@/client-side/utils";

import { getPdfFile } from "@/api/client/file/get-pdf";
import { getCsvFile } from "@/api/client/file/get-csv";
import { CampaignTablePageDraft } from "@/client-side/widgets/campaign/table-pages/campaign-page-draft";

export const CampaignPage = () => {
  const { data, isLoading, setProposalOption, addProposalOption, setCampaign } =
    useFetchCampaign();

  const [optionModal, setOptionModal] = React.useState(false);
  const [activeOption, setActiveOption] = React.useState(0);
  const [changeView, setChangeView] = React.useState(false);
  const [view, setView] = React.useState<number>(1);
  const [checked, setChecked] = React.useState(true);
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [isRequestSent, setIsRequestSent] = React.useState(false);
  const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>(
    [],
  );

  const { mutate: copyShareLink, isPending } = useCopyShareLinkMutation();
  const initOption = useProposalAccountsStore((s) => s.initOption);
  const initCampaign = useStrategyCampaignStore((s) => s.initCampaign);

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
    const res = await getCsvFile(id);

    const blob = res.data as Blob;

    downloadBlob(blob, `campaign-${id}.csv`);
  };
  const getPDF = async (id: string) => {
    const res = await getPdfFile(id);
    console.log(res, "pdf");
    const blob = res.data as Blob;

    downloadBlob(blob, `campaign-${id}.pdf`);
  };
  console.log(data, "data");

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
    if (data?.kind === "regular") {
      initCampaign(data.campaignId, data.addedAccounts, data.campaignContent);
    }
  }, [data?.kind, data?.kind === "regular" ? data.campaignContent : null]);

  if (!data || isLoading) {
    return <Loader />;
  }

  const onClickOption = (optionIndex: number) => {
    setIsRequestSent(false);
    setActiveOption(optionIndex);
    setProposalOption(campaignIdForActions ?? "", optionIndex);
  };

  // const onAddOption = async (inheritFromOption0: boolean) => {
  //   if (data.kind !== "proposal") return;

  //   const newIndex = data.existingOptions.length;
  //   const next = await addProposalOption(
  //     campaignIdForActions ?? "",
  //     inheritFromOption0,
  //   );

  //   if (next) {
  //     setActiveOption(newIndex);
  //   }

  //   setOptionModal(false);
  // };
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
    } catch (e) {
      console.error(e);
      setLocalExtraOptions((prev) => prev.filter((x) => x !== newIndex));
    } finally {
      setIsRequesting(false);
    }
  };

  const requestCampaign = async (campaignId: string) => {
    try {
      setIsRequesting(true);
      await postCampaignRequest(campaignId);
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

      await patchAddProposalOption(campaignId, optionIndex, body);

      useUpdateCampaign.getState().reset();

      await useFetchCampaign
        .getState()
        .setProposalOption(campaignId, optionIndex);

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
  return (
    <>
      <Container className="campaignBase">
        <div className="navmenu">
          <Breadcrumbs />
          <ViewChange isProposal={isProposal} setView={setView} view={view} />
        </div>

        <div className="campaignBase__title">
          <h1>{data.campaignName} - Campaign SoundInfluencers</h1>
        </div>

        {data.status === "completed" ? (
          <ul className="option-buttons">
            <li onClick={() => getCSV(data.campaignId)}>
              <img src={csv} alt="" /> CSV File
            </li>
            <li onClick={() => getPDF(data.campaignId)}>
              <img src={pdf} alt="" /> PDF File
            </li>
            <li onClick={() => copyShareLink(campaignIdForActions ?? "")}>
              <img src={share} alt="" />
              {isPending ? "Copying..." : "Share"}
            </li>
          </ul>
        ) : (
          data.kind === "regular" && (
            <div className="share-link-row">
              <div
                onClick={() => copyShareLink(campaignIdForActions ?? "")}
                className="share-link">
                <img src={link} alt="" />
                {isPending ? "Copying..." : "Copy share link"}
              </div>
            </div>
          )
        )}

        <h3>Status: {data.status}</h3>

        <div className="campaignBase__content">
          {isProposal && (
            <>
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

              <div className="controls">
                {view === -1 && (
                  <AddinitonalOption onClick={() => setOptionModal(true)} />
                )}

                {view !== 1 && (
                  <div className="ViewAudience-block">
                    <ViewAudience
                      flag={changeView}
                      onChange={() => setChangeView((prev) => !prev)}
                    />
                  </div>
                )}
              </div>
            </>
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
            />
          ) : (
            <CampaignTablePageDraft
              view={view}
              statusFlag={["distributing", "completed"].includes(data.status)}
              campaign={data}
            />
          )}
        </div>

        <Checkbox
          name="Allow automatic influencer replacement if a creator opts out."
          isChecked={checked}
          onChange={setChecked}
        />

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
                onClick={() => requestCampaign(campaignIdForActions ?? "")}
              />
            )
          ) : data.canEdit ? (
            <ButtonSecondary
              text={
                isRequestSent
                  ? "Updated"
                  : isRequesting
                    ? "Updating..."
                    : "Update"
              }
              onClick={() =>
                updateStrategyCampaign(
                  campaignIdForActions ?? "",
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
              onClick={() => requestCampaign(campaignIdForActions ?? "")}
            />
          )}
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
      )}
    </>
  );
};
