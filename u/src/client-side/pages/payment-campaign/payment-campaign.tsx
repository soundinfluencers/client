import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
  Form,
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
import { useCampaignStore } from "@/client-side/store";

export type PaymentMethodId =
  | "bank_card"
  | "paypal"
  | "bank_transfer_uk"
  | "bank_transfer_eu"
  | "bank_transfer_international";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";

export type PaymentTab = {
  id: PaymentTabId;
  label: string;
  icon: string;
  component: React.FC<any>;
};
const toBackendSelectedMethod = (
  id: PaymentMethodId,
): "ukBankTransfer" | "internationalBankTransfer" | "paypal" => {
  if (id === "paypal") return "paypal";
  if (id === "bank_transfer_uk") return "ukBankTransfer";
  return "internationalBankTransfer"; // eu + international
};
export const PaymentCampaign = () => {
  const { actions, campaignName } = useCampaignStore();

  const [tab, setTab] = React.useState<PaymentTabId>("bank_card");

  const [selectedIdPayment, setSelectedIdPayment] =
    React.useState<PaymentMethodId>("bank_card");

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
      return;
    }

    setCurrency(null);
    setSelectedIdPayment(nextTab);
  };

  const selectTransferCurrency = (
    id: "bank_transfer_uk" | "bank_transfer_eu" | "bank_transfer_international",
  ) => {
    setCurrency(id);
    setSelectedIdPayment(id);
  };

  const onSent = async (values: PaymentCampaignFormValues) => {
    const base = actions.getCampaignPayload(selectedIdPayment);

    const paymentDetails = {
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address,
      country: values.country,
      company: values.company ?? "",
      vatNumber: values.vatNumber ?? "",
      amount: base.campaignPrice ?? 0,
      selectedPaymentMethod: selectedIdPayment,
    };

    const payload = { campaignName, ...base, paymentDetails };

    console.log(payload);
    await postCampaign(payload);
  };
  return (
    <Container className="payment-campaign">
      <div className="navmenu">
        <Breadcrumbs />
      </div>

      <div className="payment-campaign__content">
        <PaymentBar
          data={PAYMENT_CAMPAIGN_TABS}
          tab={tab}
          onChange={handleTabChange}
        />

        <div className="payment-campaign__form">
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

          <div className="payment-campaign__invoice">
            <h3>Invoice details</h3>
          </div>

          <Form<PaymentCampaignFormValues>
            schema={paymentCampaignSchema}
            onSubmit={onSent}
            classNameBtnSection={tab === "bank_transfer" ? "margin" : ""}
            submitButton={
              <SubmitButton
                className="btn-margin"
                data={"Confirm payment sent"}
              />
            }
            className="payment-campaign__width">
            <PaymentForm data={PAYMENT_CAMPAIGN_TABS_INPUTS} />

            <div className="payment-campaign__confirmation">
              {CurrentConfirmation && (
                <CurrentConfirmation currency={currency ? [currency] : []} />
              )}

              {tab === "bank_transfer" && (
                <div className="PO">
                  <p>If you need PO click here</p>
                  <ButtonMain
                    className="btn"
                    text={"PO request"}
                    onClick={() => {
                      // TODO: implement modal/request
                    }}
                  />
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
};
