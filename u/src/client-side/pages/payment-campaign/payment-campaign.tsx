import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
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
  useProposalCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { useInvoceDetailsQuery } from "@/client-side/react-query";

import { FormPayment } from "@components/form/form-payment.tsx";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { postCampaign } from "@/api/client/campaign/campaign.api";
import { deleteDraft } from "@/api/client/campaign/draft.api";
import { generatePaymentReferenceNumber } from "@/client-side/utils/payment-reference";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { buildStrategyCreateCampaignPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";

import "./_payment-campaign.scss";
export type PaymentMethodId =
    | "bank_card"
    | "paypal"
    | "bank_transfer_uk"
    | "bank_transfer_eu"
    | "bank_transfer_international";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";

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
  const proposalPaymentPayload = React.useMemo(() => {
    if (!proposalId) return null;

    try {
      const raw = sessionStorage.getItem("proposalPaymentPayload");
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      const isSameProposal =
          String(parsed?.campaignId ?? "") === String(proposalId) &&
          Number(parsed?.optionIndex ?? 0) === Number(optionIndex);

      return isSameProposal ? parsed?.payload ?? null : null;
    } catch {
      return null;
    }
  }, [proposalId, optionIndex]);
  const onSent = async (values: PaymentCampaignFormValues) => {
    if (isPaymentSubmitting) return;

    try {
      setIsPaymentSubmitting(true);

      let base: Record<string, any>;

      if (effectiveDraftId) {
        const patches = useUpdateCampaign.getState().patches ?? {};
        base = draftStore.getCampaignPayload(
            effectiveDraftId,
            builderCampaignName || legacyCampaignName || "",
            selectedIdPayment,
            patches,
        );
      } else if (proposalId) {
        const patches = useUpdateCampaign.getState().patches ?? {};

        base =
            proposalPaymentPayload ??
            useProposalCampaignStore
                .getState()
                .getCampaignPayload(
                    proposalId,
                    optionIndex,
                    builderCampaignName || legacyCampaignName || "",
                    patches,
                );
      } else {
        base = buildStrategyCreateCampaignPayload({
          campaignName: builderCampaignName,
          totalPrice: builderTotalPrice,
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
        amount: Number(base?.campaignPrice ?? builderTotalPrice ?? 0),
        selectedPaymentMethod: selectedIdPayment,
        referenceNumber,
      };

      const payload = {
        ...base,
        campaignName: finalCampaignName,
        paymentDetails,
      };
      await postCampaign(payload);
      if (proposalId) {
        sessionStorage.removeItem("proposalPaymentPayload");
      }
      if (effectiveDraftId) {
        await deleteDraft(effectiveDraftId);
        draftStore.clearCampaign(effectiveDraftId);
      }

      setModalCompleted(true);
      toast.success("Campaign saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save campaign");
    } finally {
      setIsPaymentSubmitting(false);
    }
  };
  const paymentAmount = React.useMemo(() => {
    if (proposalPaymentPayload) {
      return Number(
          proposalPaymentPayload?.campaignPrice ??
          proposalPaymentPayload?.totalPrice ??
          0,
      );
    }

    return Number(builderTotalPrice ?? 0);
  }, [proposalPaymentPayload, builderTotalPrice]);
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
                            currencySymbol={selectedCurrency}
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