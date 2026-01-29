import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
  Form,
  SubmtiButton,
} from "@/components";
import { PaymentForm } from "@/pages/client/components/client-forms/payment";
import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "@/constants/client/payment-campaign-tabs.inputs";
import { PaymentBar } from "./components/payment-bar";
import "./_payment-campaign.scss";

import { useCampaignStore } from "@/store/client/createCampaign";
import { PAYMENT_CAMPAIGN_TABS } from "./components/constant/payment-campaign-tabs";
import type { PaymentTabId, PaymentMethodId } from "./types";
import { postCampaign } from "@/api/client/campaign/campaign.api";

export const PaymentCampaign = () => {
  const { actions } = useCampaignStore();

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

  const onSent = async () => {
    const payload = actions.getCampaignPayload(selectedIdPayment);

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

          <Form
            onSubmit={onSent}
            classNameBtnSection={tab === "bank_transfer" ? "margin" : ""}
            submitButton={
              <SubmtiButton
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
