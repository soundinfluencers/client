import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
  Loader,
  SubmitButton,
} from "@/components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "@/client-side/constants/payment-campaign-tabs.inputs";
import {
  paymentCampaignSchema,
  type PaymentCampaignFormValues,
} from "@/client-side/schemas";
import { PAYMENT_CAMPAIGN_TABS } from "@/client-side/data/payment-campaign-tabs";
import { PaymentBar } from "@/client-side/widgets";
import { PaymentForm } from "@/client-side/client-forms";
import {
  useCampaignStore,
  useDraftCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { useInvoceDetailsQuery } from "@/client-side/react-query";

import { FormPayment } from "@components/form/form-payment.tsx";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import {
  approveProposalCampaign,
  getProposalCampaign,
  postCampaign,
  type ApproveProposalCampaignBody,
} from "@/api/client/campaign/campaign.api";
import { deleteDraft } from "@/api/client/campaign/draft.api";
import { generatePaymentReferenceNumber } from "@/client-side/utils/payment-reference";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
  buildStrategyCreateCampaignPayload,
  requireRegularCampaignDisplayCurrency,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import type {
  CreateRegularCampaignRequest,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import {
  getCampaignCurrencySymbol,
  isCampaignDisplayCurrency,
  type CampaignDisplayCurrency,
} from "@/shared/functions/formatCurrency";

import "./_payment-campaign.scss";
export type PaymentMethodId =
    | "bank_card"
    | "paypal"
    | "bank_transfer_uk"
    | "bank_transfer_eu"
    | "bank_transfer_international";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";

type ProposalPaymentOption = {
  campaignId: string;
  optionIndex: number;
  price: number;
  displayCurrency: CampaignDisplayCurrency;
};

type ProposalPaymentLoadState = "idle" | "loading" | "ready" | "error";

export const PaymentCampaign = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [referenceNumber, setReferenceNumber] = React.useState(() =>
      generatePaymentReferenceNumber("bank_card"),
  );
  const [tab, setTab] = React.useState<PaymentTabId>("bank_card");
  const [modalCompleted, setModalCompleted] = React.useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = React.useState(false);
  const [selectedIdPayment, setSelectedIdPayment] =
      React.useState<PaymentMethodId>("bank_card");
  const [currency, setCurrency] = React.useState<
      | "bank_transfer_uk"
      | "bank_transfer_eu"
      | "bank_transfer_international"
      | null
  >(null);

  const draftIdFromParams = searchParams.get("draft");
  const proposalId = searchParams.get("proposal");
  const optionIndex = Number(searchParams.get("option") ?? 0);
  const isValidProposalOptionIndex =
      Number.isInteger(optionIndex) && optionIndex >= 0;
  const [proposalPaymentOption, setProposalPaymentOption] =
      React.useState<ProposalPaymentOption | null>(null);
  const [proposalPaymentLoadState, setProposalPaymentLoadState] =
      React.useState<ProposalPaymentLoadState>(proposalId ? "loading" : "idle");

  React.useEffect(() => {
    if (!proposalId) {
      setProposalPaymentOption(null);
      setProposalPaymentLoadState("idle");
      return;
    }

    sessionStorage.removeItem("proposalPaymentPayload");
    sessionStorage.removeItem("postAuthRedirect");

    if (!isValidProposalOptionIndex) {
      setProposalPaymentOption(null);
      setProposalPaymentLoadState("error");
      return;
    }

    let cancelled = false;

    setProposalPaymentOption(null);
    setProposalPaymentLoadState("loading");

    void getProposalCampaign(proposalId, optionIndex)
        .then((response) => {
          if (cancelled) return;

          const proposal = response.data.data;
          const selectedOption = proposal?.selectedOption;
          const price = Number(selectedOption?.price);
          const isAuthoritativeOption =
              String(proposal?.campaignId ?? "") === String(proposalId) &&
              selectedOption?.optionIndex === optionIndex &&
              Number.isFinite(price) &&
              isCampaignDisplayCurrency(selectedOption?.displayCurrency);

          if (!isAuthoritativeOption) {
            setProposalPaymentOption(null);
            setProposalPaymentLoadState("error");
            return;
          }

          setProposalPaymentOption({
            campaignId: proposal.campaignId,
            optionIndex: selectedOption.optionIndex,
            price,
            displayCurrency: selectedOption.displayCurrency,
          });
          setProposalPaymentLoadState("ready");
        })
        .catch((error) => {
          if (cancelled) return;

          console.error("Failed to load Proposal option for payment", error);
          setProposalPaymentOption(null);
          setProposalPaymentLoadState("error");
        });

    return () => {
      cancelled = true;
    };
  }, [proposalId, optionIndex, isValidProposalOptionIndex]);

  const { data: invoiceDetails } = useInvoceDetailsQuery();

  const draftStore = useDraftCampaignStore();

  const legacyCampaignName = useCampaignStore((s) => s.campaignName);
  const legacyDraftId = useCampaignStore((s) => s.draftId);
  // const { actions: legacyActions } = useCampaignStore();

  const builderCampaignName = useCampaignBuilderStore((s) => s.campaignName);
  const builderDraftId = useCampaignBuilderStore((s) => s.draftId);
  const builderAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
  const builderContent = useCampaignBuilderStore((s) => s.campaignContent);
  const builderTotalPrice = useCampaignBuilderStore((s) => s.totalPrice);
  const builderSelectionCurrency = useCampaignBuilderStore(
      (s) => s.selectionCurrency,
  );
  console.log("builderCampaignName", builderCampaignName);
  console.log("builderTotalPrice", builderTotalPrice);
  console.log("builderAccounts", builderAccounts);
  console.log("builderContent", builderContent);
  console.log("builderDraftId", builderDraftId);
  const effectiveDraftId = draftIdFromParams || legacyDraftId || null;

  const CurrentConfirmation = PAYMENT_CAMPAIGN_TABS.find(
      (tb) => tab === tb.id,
  )?.component;

  const transferOptions: {
    name: string;
    id: "bank_transfer_uk" | "bank_transfer_eu" | "bank_transfer_international";
  }[] = [
    { name: "UK", id: "bank_transfer_uk" },
    { name: "EU", id: "bank_transfer_eu" },
    { name: "International", id: "bank_transfer_international" },
  ];

  const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
  const hasAuthoritativeProposalPaymentOption =
      proposalPaymentLoadState === "ready" &&
      proposalPaymentOption?.campaignId === proposalId &&
      proposalPaymentOption?.optionIndex === optionIndex;
  const handleTabChange = React.useCallback((nextTab: PaymentTabId) => {
    setTab(nextTab);

    if (nextTab === "bank_transfer") {
      const nextMethod = "bank_transfer_uk" as const;
      setCurrency(nextMethod);
      setSelectedIdPayment(nextMethod);
      setReferenceNumber(generatePaymentReferenceNumber(nextMethod));
      return;
    }

    setCurrency(null);
    setSelectedIdPayment(nextTab);
    setReferenceNumber(generatePaymentReferenceNumber(nextTab));
  }, []);

  const selectTransferCurrency = React.useCallback(
      (id: "bank_transfer_uk" | "bank_transfer_eu" | "bank_transfer_international") => {
        setCurrency(id);
        setSelectedIdPayment(id);
        setReferenceNumber(generatePaymentReferenceNumber(id));
      },
      [],
  );
  const onSent = async (values: PaymentCampaignFormValues) => {
    if (isPaymentSubmitting) return;

    try {
      setIsPaymentSubmitting(true);

      if (proposalId) {
        if (
            !hasAuthoritativeProposalPaymentOption ||
            !proposalPaymentOption
        ) {
          toast.error("Proposal option must be reloaded before approval");
          return;
        }

        const proposalPaymentDetails: ApproveProposalCampaignBody = {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          country: values.country,
          company: values.company ?? "",
          vatNumber: values.vatNumber ?? "",
          selectedPaymentMethod: selectedIdPayment,
          referenceNumber,
        };

        await approveProposalCampaign(
            proposalPaymentOption.campaignId,
            proposalPaymentOption.optionIndex,
            proposalPaymentDetails,
        );
        sessionStorage.removeItem("proposalPaymentPayload");
        sessionStorage.removeItem("postAuthRedirect");
      } else {
        let base: CreateRegularCampaignRequest & { totalPrice?: number };

        if (effectiveDraftId) {
          const patches = useUpdateCampaign.getState().patches ?? {};

          base = draftStore.getCampaignPayload(
              effectiveDraftId,
              builderCampaignName || legacyCampaignName || "",
              selectedIdPayment,
              patches,
          );
        } else {
          const displayCurrency = requireRegularCampaignDisplayCurrency(
              builderSelectionCurrency,
          );

          base = buildStrategyCreateCampaignPayload({
            campaignName: builderCampaignName,
            totalPrice: builderTotalPrice,
            displayCurrency,
            accounts: builderAccounts,
            content: builderContent,
            paymentDetails: {
              firstName: values.firstName,
              lastName: values.lastName,
              address: values.address,
              country: values.country,
              company: values.company ?? "",
              vatNumber: values.vatNumber ?? "",
              amount: Number(builderTotalPrice ?? 0),
              referenceNumber,
              selectedPaymentMethod: selectedIdPayment,
            },
          });
        }

        const finalCampaignName = String(
            base?.campaignName ?? builderCampaignName ?? legacyCampaignName ?? "",
        );
        const paymentDetails = {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          country: values.country,
          company: values.company ?? "",
          vatNumber: values.vatNumber ?? "",
          amount: Number(
              base?.campaignPrice ??
              base?.totalPrice ??
              builderTotalPrice ??
              0,
          ),
          selectedPaymentMethod: selectedIdPayment,
          referenceNumber,
        };
        const payload = {
          ...base,
          campaignName: finalCampaignName,
          paymentDetails,
        };

        await postCampaign(payload);
      }

      if (!proposalId && effectiveDraftId) {
        await deleteDraft(effectiveDraftId);
        draftStore.clearCampaign(effectiveDraftId);
      }

      setModalCompleted(true);
      toast.success(
          proposalId
              ? "Proposal approved successfully!"
              : "Campaign saved successfully!",
      );
    } catch (e) {
      console.error(e);
      toast.error(
          proposalId
              ? "Failed to approve proposal"
              : "Failed to save campaign",
      );
    } finally {
      setIsPaymentSubmitting(false);
    }
  };
  const paymentAmount = React.useMemo(() => {
    if (proposalId) {
      return hasAuthoritativeProposalPaymentOption
          ? proposalPaymentOption?.price ?? 0
          : 0;
    }

    return Number(builderTotalPrice ?? 0);
  }, [
    proposalId,
    hasAuthoritativeProposalPaymentOption,
    proposalPaymentOption?.price,
    builderTotalPrice,
  ]);
  const paymentCurrencySymbol = hasAuthoritativeProposalPaymentOption && proposalPaymentOption
      ? getCampaignCurrencySymbol(proposalPaymentOption.displayCurrency)
      : selectedCurrency;
  const defaultValues = React.useMemo<Partial<PaymentCampaignFormValues>>(
      () => ({
        firstName: invoiceDetails?.firstName ?? "",
        lastName: invoiceDetails?.lastName ?? "",
        address: invoiceDetails?.address ?? "",
        country: invoiceDetails?.country ?? "",
        company: invoiceDetails?.company ?? "",
        vatNumber: invoiceDetails?.vatNumber ?? "",
      }),
      [invoiceDetails],
  );

  if (proposalId && !hasAuthoritativeProposalPaymentOption) {
    if (proposalPaymentLoadState === "error") {
      return (
          <Container className="payment-campaign">
            <p>Failed to load the selected Proposal option.</p>
          </Container>
      );
    }

    return <Loader/>;
  }

  return (
      <Container className="payment-campaign">
        <div className="navmenu">
          <Breadcrumbs />
        </div>

        <h1>Payment method</h1>

        <div className="payment-campaign__content">
          <div className="payment-campaign__form">
            <PaymentBar
                data={PAYMENT_CAMPAIGN_TABS}
                tab={tab}
                onChange={handleTabChange}
            />
            <FormPayment<PaymentCampaignFormValues>
                schema={paymentCampaignSchema}
                onSubmit={onSent}
                defaultValues={defaultValues}
                classNameBtnSection={tab === "bank_transfer" ? "margin" : ""}
                submitButton={
                  <SubmitButton
                      className="btn-margin"
                      data="Confirm payment sent"
                  />
                }
                className="payment-campaign__width"
            >
              <div className="payment-campaign__form-flex">



                <div className="payment-campaign__form-flex-width">
                  {tab === "bank_transfer" && (
                      <ul className="ul-BankTransfer">
                        {transferOptions.map((cr) => (
                            <li
                                key={cr.id}
                                className={currency === cr.id ? "active" : ""}
                                onClick={() => selectTransferCurrency(cr.id)}
                            >
                              {cr.name}
                            </li>
                        ))}
                      </ul>
                  )}
                  <div className="payment-campaign__confirmation">
                    {CurrentConfirmation && (
                        <CurrentConfirmation
                            currencySymbol={paymentCurrencySymbol}
                            currency={currency ? [currency] : []}
                            referenceNumber={referenceNumber}
                            isSubmitting={isPaymentSubmitting}
                            amount={paymentAmount}
                        />
                    )}
                  </div>
                  <div className="payment-campaign__invoice">
                    <h3>Invoice details</h3>
                  </div>



                  <PaymentForm data={PAYMENT_CAMPAIGN_TABS_INPUTS} />
                </div>
              </div>


            </FormPayment>
          </div>
        </div>

        {modalCompleted && (
            <Modal
                addStyles="content-width"
                onClose={() => {
                  setModalCompleted(false);
                  navigate("/client");
                }}
            >
              <div className="modal-payment">
                <h2>Campaign Received</h2>
                <h3>Thanks for your payment!</h3>
                <p>
                  We are reviewing your campaign and will notify you once it&apos;s
                  approved and sent to distribution.
                </p>
                <ButtonMain
                    className="btn"
                    text="Ok"
                    onClick={() => {
                      setModalCompleted(false);
                      navigate("/client");
                    }}
                />
              </div>
            </Modal>
        )}
      </Container>
  );
};
