import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
  SubmitButton,
} from "@/components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  useDraftCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";
import { useInvoceDetailsQuery } from "@/client-side/react-query";

import { FormPayment } from "@components/form/form-payment.tsx";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import {approveProposalCampaign, postCampaign} from "@/api/client/campaign/campaign.api";
import { deleteDraft, getCampaignDraft } from "@/api/client/campaign/draft.api";
import { generatePaymentReferenceNumber } from "@/client-side/utils/payment-reference";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { buildStrategyCreateCampaignPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import { currencyCode, getBuilderSelectedOffer, isInvalidOfferError, OfferSelectionError } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { hydrateCampaignBuilderFromDraft } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import type { CreateRegularCampaignRequest } from "@/api/client/campaign/create-campaign.types";
import { resolveCheckoutContext, submitCheckout } from "./checkout-context";
import { OfferCatalogueReview } from "./offer-catalogue-review";

import { useProposalCheckout } from "./use-proposal-checkout";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/store/get-user";

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
  const { pathname, key: locationKey } = useLocation();
  const queryClient = useQueryClient();

  const [referenceNumber, setReferenceNumber] = React.useState(() =>
      generatePaymentReferenceNumber("bank_card"),
  );
  const [tab, setTab] = React.useState<PaymentTabId>("bank_card");
  const [modalCompleted, setModalCompleted] = React.useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = React.useState(false);
  const submissionLock = React.useRef(false);
  const creationCompleted = React.useRef(false);
  const [checkoutCompleted, setCheckoutCompleted] = React.useState(false);
  const [cleanupWarning, setCleanupWarning] = React.useState<string | null>(null);
  const [offerError, setOfferError] = React.useState<string | null>(null);
  const [catalogueOpen, setCatalogueOpen] = React.useState(false);
  const [draftLoadError, setDraftLoadError] = React.useState<string | null>(null);
  const [selectedIdPayment, setSelectedIdPayment] =
      React.useState<PaymentMethodId>("bank_card");
  const [currency, setCurrency] = React.useState<
      | "bank_transfer_uk"
      | "bank_transfer_eu"
      | "bank_transfer_international"
      | null
  >(null);


  const { data: invoiceDetails } = useInvoceDetailsQuery();

  const draftStore = useDraftCampaignStore();

  const builderDraftId = useCampaignBuilderStore((s) => s.draftId);
  const builderTotalPrice = useCampaignBuilderStore((s) => s.totalPrice);
  const builderPriceReady = useCampaignBuilderStore((s) => s.totalPriceReady);
  const unsupportedBundles = useCampaignBuilderStore((s) => s.unsupportedDraftBundles);
  const builderOffer = useCampaignBuilderStore((s) => s.selectedOfferId);
  const builderOfferAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
  const builderCatalogue = useCampaignBuilderStore((s) => s.offerCatalogContext);
  const context = React.useMemo(() => resolveCheckoutContext(pathname, searchParams, builderDraftId),
      [pathname, searchParams.toString(), builderDraftId]);

  const auth = useAuth();
  const user = useUser((s) => s.user);
  const canApprove = auth.isAuthReady && !!auth.accessToken && ["client", "admin"].includes(user?.role ?? "");
  const proposalCheckout = useProposalCheckout(context, canApprove, `${locationKey ?? ""}:${pathname}?${searchParams.toString()}`);

  React.useEffect(() => {
    if (context.kind !== "draft") return;
    const id = context.draftId;
    const store = useDraftCampaignStore.getState();
    if (store.accountsByCampaignId[id] && store.contentByCampaignId[id] && store.metadataByDraftId[id]) return;
    // Do not refetch over a partially initialized local editing session.
    if (store.accountsByCampaignId[id] || store.contentByCampaignId[id]) {
      setDraftLoadError("Please reopen this draft from the dashboard before payment.");
      return;
    }
    let cancelled = false;
    setDraftLoadError(null);
    void getCampaignDraft(id).then((draft) => {
      if (cancelled) return;
      if (String(draft?._id ?? "") !== id) throw new Error("The loaded draft does not match this checkout.");
      useDraftCampaignStore.getState().initCampaign(id, draft.addedAccounts ?? [], draft.campaignContent ?? [], {
        campaignName: draft.campaignName, selectedOffer: draft.selectedOffer ?? null, displayCurrency: draft.displayCurrency,
      });
    }).catch((error) => {
      if (!cancelled) setDraftLoadError(error instanceof Error ? error.message : "Failed to load draft.");
    });
    return () => { cancelled = true; };
  }, [context]);

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

  const builderCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
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
  const draftMeta = context.kind === "draft" ? draftStore.metadataByDraftId[context.draftId] : null;
  const draftReady = context.kind === "draft" && Boolean(draftMeta &&
      draftStore.accountsByCampaignId[context.draftId] && draftStore.contentByCampaignId[context.draftId]);
  const contextError = context.kind === "invalid" ? context.message
      : context.kind === "draft" && !draftReady ? draftLoadError ?? "Loading your draft…"
      : context.kind === "draft" && draftStore.accountsByCampaignId[context.draftId]?.some((row) =>
          (row as { source?: string; bundleId?: string }).source === "bundle" || (row as { bundleId?: string }).bundleId)
          ? "This checkout does not support bundle drafts. No selections will be submitted."
      : context.kind === "proposal" ? proposalCheckout.status === "ready" && canApprove ? null
          : proposalCheckout.message ?? (!canApprove ? "Sign in with a client account to approve this Proposal."
              : proposalCheckout.status === "submitting" ? "Confirming the saved option..." : "Loading your saved option...")
      : context.kind === "builder" && unsupportedBundles ? "This builder does not support bundle drafts. No selections will be submitted."
      : context.kind === "builder" && !builderPriceReady && builderOfferAvailable !== false ? "Prices are unavailable in the selected currency. Return to selection and choose a currency with confirmed prices."
      : context.kind === "draft" && !Number.isSafeInteger(draftStore.getCampaignPrice(context.draftId)) ? "Draft prices are unavailable in its selected currency. Please review the selection."
      : null;
  const paymentAmount = context.kind === "builder" ? Number(builderTotalPrice ?? 0)
      : context.kind === "draft" && draftReady ? draftStore.getCampaignPrice(context.draftId)
      : context.kind === "proposal" ? proposalCheckout.saved?.selectedOption.price ?? 0 : 0;
  const currencySymbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
  const selectedCurrency = context.kind === "builder" ? builderCurrency
      : context.kind === "draft" && draftReady
          ? currencySymbols[draftStore.getCampaignPriceBreakdown(context.draftId).currency] ?? ""
          : context.kind === "proposal" ? currencySymbols[proposalCheckout.saved?.selectedOption.displayCurrency ?? ""] ?? "" : "";
  const offerIsAvailable = context.kind === "builder" ? builderOfferAvailable : draftMeta?.selectedOffer?.isAvailable;
  const hasOffer = context.kind === "builder" ? Boolean(builderOffer) : Boolean(draftMeta?.selectedOffer);
  const openCatalogue = async () => {
    await queryClient.invalidateQueries({ queryKey: ["publishedOffers"], refetchType: "none" });
    setCatalogueOpen(true);
  };
  const reviewSelection = (catalogue: { platform: string; genre: string }) => {
    if (context.kind === "draft") {
      const store = useDraftCampaignStore.getState();
      const id = context.draftId;
      const meta = store.metadataByDraftId[id];
      if (!meta || !store.accountsByCampaignId[id] || !store.contentByCampaignId[id]) return;
      const patches = useUpdateCampaign.getState().patches;
      // Carry this draft's local edits into the existing builder flow, never another store's campaign.
      hydrateCampaignBuilderFromDraft({
        _id: id, step: "strategyTable", campaignName: meta.campaignName, socialMedia: "multipromo",
        displayCurrency: meta.displayCurrency, selectedOffer: meta.selectedOffer,
        addedAccounts: store.accountsByCampaignId[id].map((account) => ({
          ...account, selectedCampaignContentItem: account.selectedCampaignContentItem ?? account.selectedContent,
        })),
        campaignContent: store.contentByCampaignId[id].map((item) => ({ ...item, ...patches[item._id] })),
      } as unknown as CampaignDraftDto);
    }
    const displayCurrency = context.kind === "draft" ? draftMeta?.displayCurrency ?? "EUR" : currencyCode(builderCurrency);
    navigate(`/client/create-campaign?${new URLSearchParams({ ...catalogue, currency: displayCurrency })}`);
  };
  const onSent = async (values: PaymentCampaignFormValues) => {
    if (context.kind === "proposal") {
      await proposalCheckout.approve({ firstName: values.firstName, lastName: values.lastName,
        address: values.address, country: values.country, company: values.company ?? "",
        vatNumber: values.vatNumber ?? "", selectedPaymentMethod: selectedIdPayment, referenceNumber });
      return;
    }
    if (submissionLock.current || creationCompleted.current) return;
    submissionLock.current = true;

    try {
      setIsPaymentSubmitting(true);

      if (contextError) throw new Error(contextError);
      let base: Omit<CreateRegularCampaignRequest, "paymentDetails">;

      if (context.kind === "draft") {
        const patches = useUpdateCampaign.getState().patches ?? {};

        base = draftStore.getCampaignPayload(
            context.draftId,
            draftMeta?.campaignName ?? "",
            selectedIdPayment,
            patches,
        );
      } else {
        const state = useCampaignBuilderStore.getState();
        if (!state.totalPriceReady && state.selectedOfferIsAvailable !== false) throw new Error("Prices are not ready for checkout.");
        base = buildStrategyCreateCampaignPayload({
          campaignName: state.campaignName,
          totalPrice: state.totalPrice,
          displayCurrency: state.selectedCurrency,
          accounts: state.selectedAccounts,
          content: state.campaignContent,
          selectedOffer: getBuilderSelectedOffer(state),
          offerIsAvailable: state.selectedOfferIsAvailable,
          paymentDetails: {
            firstName: values.firstName,
            lastName: values.lastName,
            address: values.address,
            country: values.country,
            company: values.company ?? "",
            vatNumber: values.vatNumber ?? "",
            amount: Number(state.totalPrice ?? 0),
            referenceNumber,
            selectedPaymentMethod: selectedIdPayment,
          },
        });
      }

      const paymentDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        country: values.country,
        company: values.company ?? "",
        vatNumber: values.vatNumber ?? "",
        amount: Number(base.campaignPrice ?? paymentAmount),
        selectedPaymentMethod: selectedIdPayment,
        referenceNumber,
      };



      const result = await submitCheckout({
        context, base, paymentDetails, offerIsAvailable,
        postCampaign, approveProposal: approveProposalCampaign, deleteDraft,
        onCreated: () => {
          creationCompleted.current = true;
          setCheckoutCompleted(true);
          setModalCompleted(true);
        },
        clearDraft: (id) => {
          if (context.kind === "draft") useDraftCampaignStore.getState().clearCampaign(id);
          if (context.kind === "builder" && useCampaignBuilderStore.getState().draftId === id) {
            useCampaignBuilderStore.getState().actions.setDraftMeta({ draftId: null, draftStep: null });
          }
        },
      });
      if (result.cleanupError) setCleanupWarning("Your campaign was created successfully, but its old draft could not be removed. Do not submit it again; remove the old draft from the dashboard.");

      setModalCompleted(true);
      toast.success(
          "Campaign saved successfully!",
      );
    } catch (e) {
      console.error(e);
      if (e instanceof OfferSelectionError || isInvalidOfferError(e)) {
        setOfferError(e instanceof OfferSelectionError ? e.message : "Your selected offer is no longer valid. Refresh the catalogue and review your selection.");
        return;
      }
      toast.error(
          "Failed to save campaign",
      );
    } finally {
      setIsPaymentSubmitting(false);
      submissionLock.current = false;
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

  return (
      <Container className="payment-campaign">
        <div className="navmenu">
          <Breadcrumbs />
        </div>

        <h1>Payment method</h1>
        {contextError && <p role={context.kind === "proposal" && proposalCheckout.status === "completed" ? "status" : "alert"}>{contextError}</p>}
        {context.kind === "proposal" && <section aria-label="Saved Proposal option">
          {proposalCheckout.saved && <>
            <h2>{proposalCheckout.saved.campaignName} - Option {context.optionIndex + 1}</h2>
            <p>{selectedCurrency}{paymentAmount} {proposalCheckout.saved.selectedOption.displayCurrency}</p>
            {proposalCheckout.saved.selectedOption.selectedOffer && <p>
              Offer: {proposalCheckout.saved.selectedOption.selectedOffer.title}
              {" - "}{proposalCheckout.saved.selectedOption.selectedOffer.selectedAccountIds?.length ?? 0} accounts
            </p>}
            <ul>{proposalCheckout.saved.selectedOption.addedAccounts.map((row, index) =>
              <li key={row.addedAccountsId ?? index}>{row.username ?? row.socialAccountId} - {row.socialMedia}</li>)}</ul>
          </>}
          {!contextError && proposalCheckout.message && <p role="status">{proposalCheckout.message}</p>}
          {proposalCheckout.status === "error" && <button type="button" onClick={() => void proposalCheckout.load()}>Retry reading saved option</button>}
          {proposalCheckout.status === "completed" && <button type="button" onClick={() => navigate("/client")}>Go to dashboard</button>}
        </section>}
        {hasOffer && offerIsAvailable === false && <div role="alert">
          <p>Your saved offer is unavailable or has changed. Please review your selection.</p>
          <button type="button" onClick={() => void openCatalogue()}>Refresh catalogue / review offer</button>
        </div>}

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
                  context.kind === "proposal" ? <button type="submit" disabled={!proposalCheckout.canSubmit}>
                    {proposalCheckout.status === "completed" ? "Proposal approved" : proposalCheckout.status === "uncertain"
                      ? "Approval outcome unknown" : proposalCheckout.busy ? "Please wait..." : "Confirm payment sent"}
                  </button> : checkoutCompleted ? <button type="button" disabled>Campaign created</button> : <SubmitButton
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
                    {CurrentConfirmation && !contextError && !(hasOffer && offerIsAvailable === false) && (
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

        {(offerError || catalogueOpen) && <Modal onClose={() => { setOfferError(null); setCatalogueOpen(false); }}>
          <div role="alert">
            <h2>Review your selected offer</h2>
            <p>{offerError ?? "Refresh the catalogue before reviewing your saved selection."}</p>
            {!catalogueOpen && <button type="button" onClick={() => void openCatalogue()}>Refresh catalogue</button>}
            {catalogueOpen && <OfferCatalogueReview
                initialContext={context.kind === "builder" ? builderCatalogue : draftMeta?.selectedOffer?.socialMedia || draftMeta?.selectedOffer?.genre
                    ? { platform: draftMeta.selectedOffer.socialMedia ?? "", genre: draftMeta.selectedOffer.genre ?? "" } : null}
                onReviewSelection={reviewSelection}
            />}
            <button type="button" onClick={() => { setOfferError(null); setCatalogueOpen(false); }}>Close</button>
          </div>
        </Modal>}
        {context.kind !== "proposal" && modalCompleted && (
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
                {cleanupWarning && <p role="status">{cleanupWarning}</p>}
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
