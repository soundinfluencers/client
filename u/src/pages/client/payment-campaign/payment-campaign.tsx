import React from "react";
import {
  Breadcrumbs,
  ButtonMain,
  Container,
  Form,
  SubmtiButton,
} from "@/components";
import { PaymentForm } from "@/pages/client/components/client-forms/payment";
import { PAYMENT_CAMPAIGN_TABS } from "@/constants/client/payment-campaign-tabs";
import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "@/constants/client/payment-campaign-tabs.inputs";
import { PaymentBar } from "./components/payment-bar";
import type { CurrencyType } from "@/types/client/form-clients/payment-campaign-inputs";
import "./_payment-campaign.scss";

export const PaymentCampaign = () => {
  const [tab, setTab] = React.useState<string>("BankCard");
  const [Currency, setCurrency] = React.useState<CurrencyType[]>([]);
  const CurrentConfirmation = PAYMENT_CAMPAIGN_TABS.find(
    (tb) => tab === tb.id
  )?.component;
  const currency = [
    { name: "UK", id: "UK" },
    { name: "EU", id: "EU" },
    { name: "International", id: "International" },
  ];
  const toggleCurrency = (id: CurrencyType) => {
    setCurrency((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  return (
    <Container className="payment-campaign">
      <div className="navmenu">
        <Breadcrumbs />
      </div>
      <div className="payment-campaign__content">
        <PaymentBar data={PAYMENT_CAMPAIGN_TABS} tab={tab} onChange={setTab} />
        <div className="payment-campaign__form">
          {tab === "BankTransfer" && (
            <ul className="ul-BankTransfer">
              {currency.map((cr, i) => {
                const isActive = Currency.includes(cr.id as CurrencyType);
                return (
                  <li
                    className={isActive ? "active" : ""}
                    onClick={() => toggleCurrency(cr.id as CurrencyType)}
                    key={i}>
                    {cr.name}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="payment-campaign__invoice">
            <h3>Invoice details</h3>
          </div>

          <Form
            classNameBtnSection={tab === "BankTransfer" ? "margin" : ""}
            submitButton={<SubmtiButton data={"Confirm payment sent"} />}
            className="payment-campaign__width">
            <PaymentForm data={PAYMENT_CAMPAIGN_TABS_INPUTS} />{" "}
            <div className="payment-campaign__confirmation">
              {CurrentConfirmation && (
                <CurrentConfirmation currency={Currency as CurrencyType[]} />
              )}
              {tab === "BankTransfer" && (
                <div className="PO">
                  <p>If you need PO click here</p>
                  <ButtonMain
                    className="btn"
                    text={"PO request"}
                    onClick={function (): void {
                      throw new Error("Function not implemented.");
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
