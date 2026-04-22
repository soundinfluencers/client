import React from "react";
import {
  Breadcrumbs,
  ButtonMain,

  Container,

  SubmitButton,
} from "@/components";

import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "@/client-side/constants/payment-campaign-tabs.inputs";

import "./_payment-campaign.scss";

import { postCampaign } from "@/api/client/campaign/campaign.api";
import {
  paymentCampaignSchema,
  type PaymentCampaignFormValues,
} from "@/client-side/schemas";

import { PaymentBar } from "@/client-side/widgets";
import { PAYMENT_CAMPAIGN_TABS } from "@/client-side/data/payment-campaign-tabs";
import { PaymentForm } from "@/client-side/client-forms";
import {
  useCampaignStore,
  useDraftCampaignStore,
  useProposalCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteDraft } from "@/api/client/campaign/draft.api";
import { useInvoceDetailsQuery } from "@/client-side/react-query";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import {FormPayment} from "@components/form/form-payment.tsx";
import { generatePaymentReferenceNumber } from "@/client-side/utils/payment-reference";

export type PaymentMethodId =
  | "bank_card"
  | "paypal"
  | "bank_transfer_uk"
  | "bank_transfer_eu"
  | "bank_transfer_international";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";


export const PaymentCampaign = () => {
  const [searchParams] = useSearchParams();
  const [referenceNumber, setReferenceNumber] = React.useState(() =>
      generatePaymentReferenceNumber("bank_card"),
  );
  const draftId = searchParams.get("draft");
  const campaignDraftId = useCampaignStore((s) => s.draftId);
  const proposalId = searchParams.get("proposal");
  const optionIndex = Number(searchParams.get("option") ?? 0);
  const { data: invoiceDetails } =
    useInvoceDetailsQuery();
  const draftStore = useDraftCampaignStore();
  const { actions, campaignName } = useCampaignStore();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<PaymentTabId>("bank_card");
  const [modalCompleted, setModalCompleted] = React.useState(false);
  const [selectedIdPayment, setSelectedIdPayment] =
    React.useState<PaymentMethodId>("bank_card");
  const effectiveDraftId = draftId || campaignDraftId || null;
  const [currency, setCurrency] = React.useState<
    | "bank_transfer_uk"
    | "bank_transfer_eu"
    | "bank_transfer_international"
    | null
  >(null);

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

  const handleTabChange = (nextTab: PaymentTabId) => {
    setTab(nextTab);

    if (nextTab === "bank_transfer") {
      const def = "bank_transfer_uk" as const;
      setCurrency(def);
      setSelectedIdPayment(def);
      setReferenceNumber(generatePaymentReferenceNumber(def));
      return;
    }

    setCurrency(null);
    setSelectedIdPayment(nextTab);
    setReferenceNumber(generatePaymentReferenceNumber(nextTab));
  };

  const selectTransferCurrency = (
      id: "bank_transfer_uk" | "bank_transfer_eu" | "bank_transfer_international",
  ) => {
    setCurrency(id);
    setSelectedIdPayment(id);
    setReferenceNumber(generatePaymentReferenceNumber(id));
  };

  const onSent = async (values: PaymentCampaignFormValues) => {
    try {
      let base: any;

      if (effectiveDraftId) {
        const patches = useUpdateCampaign.getState().patches ?? {};
        base = draftStore.getCampaignPayload(
            effectiveDraftId,
            campaignName ?? "",
            selectedIdPayment,
            patches,
        );
      } else if (proposalId) {
        const cached = useProposalCampaignStore
            .getState()
            .getProposalPayload(proposalId, optionIndex);

        const patches = useUpdateCampaign.getState().patches ?? {};
        base =
            cached ??
            useProposalCampaignStore
                .getState()
                .getCampaignPayload(
                    proposalId,
                    optionIndex,
                    campaignName ?? "",
                    patches,
                );
      } else {
        base = actions.getCampaignPayload(selectedIdPayment);
      }

      const finalCampaignName = String(
          base?.campaignName ?? campaignName ?? "",
      );

      const paymentDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        country: values.country,
        company: values.company ?? "",
        vatNumber: values.vatNumber ?? "",
        amount: Number(base?.campaignPrice ?? 0),
        selectedPaymentMethod: selectedIdPayment,
        referenceNumber
      };

      const payload = {
        ...base,
        campaignName: finalCampaignName,
        paymentDetails,
      };

      console.log(payload, "payload");
      await postCampaign(payload);

      if (effectiveDraftId) {
        await deleteDraft(effectiveDraftId);
        draftStore.clearCampaign(effectiveDraftId);
      }
      setModalCompleted(true);
      toast.success("Campaign saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save campaign");
    }
  };
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
  console.log(invoiceDetails,'invoiceDetails')
  return (
    <Container className="payment-campaign">
      <div className="navmenu">
        <Breadcrumbs />
      </div>
      <h1>Payment method</h1>
      <div className="payment-campaign__content">


        <div className="payment-campaign__form">




          <FormPayment<PaymentCampaignFormValues>
            schema={paymentCampaignSchema}
            onSubmit={onSent}
            defaultValues={defaultValues}
            classNameBtnSection={tab === "bank_transfer" ? "margin" : ""}
            submitButton={
              <SubmitButton
                className="btn-margin"
                data={"Confirm payment sent"}
              />
            }
            className="payment-campaign__width">
            <div className="payment-campaign__form-flex">
              <PaymentBar
                  data={PAYMENT_CAMPAIGN_TABS}
                  tab={tab}
                  onChange={handleTabChange}
              />
              <div className="payment-campaign__form-flex-width">
                <div className="payment-campaign__invoice">
                  <h3>Invoice details</h3>
                </div>
                {tab === "bank_transfer" && (
                    <ul className="ul-BankTransfer">
                      {transferOptions.map((cr) => (
                          <li
                              key={cr.id}
                              className={currency === cr.id ? "active" : ""}
                              onClick={() => selectTransferCurrency(cr.id)}>
                            {cr.name}
                          </li>
                      ))}
                    </ul>
                )}
                <PaymentForm data={PAYMENT_CAMPAIGN_TABS_INPUTS} />
              </div>

            </div>
            <div className="payment-campaign__confirmation">
              {CurrentConfirmation && (
                  <CurrentConfirmation
                      currency={currency ? [currency] : []}
                      referenceNumber={referenceNumber}
                  />
              )}

              {/* {tab === "bank_transfer" && (
                <div className="PO">
                  <p>If you need PO click here</p>
                  <ButtonSecondary
                    className="btn"
                    text={"PO request"}
                    onClick={() => {
                      // TODO: implement modal/request
                    }}
                  />
                </div>
              )} */}
            </div>

          </FormPayment>
        </div>
      </div>

      {modalCompleted && (
        <Modal addStyles='content-width'
          onClose={() => {
            setModalCompleted(false);
            navigate("/client");
          }}>
          <div className="modal-payment">
            <h2>Campaign Received</h2>
            <h3>Thanks for your payment!</h3>
            <p>
              We're reviewing your campaign and will notify you once it's
              approved and sent to distribution.
            </p>
            <ButtonMain
              className="btn"
              text={"Ok"}
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
