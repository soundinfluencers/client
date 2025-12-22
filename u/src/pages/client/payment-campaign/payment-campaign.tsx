import React from "react";
import { ButtonMain, Container, Form, SubmtiButton } from "../../../components";
import { PaymentForm } from "../../../components/form/client-forms/payment";
import { PAYMENT_CAMPAIGN_TABS } from "../../../constants/payment-campaign-tabs";
import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "../../../constants/payment-campaign-tabs.inputs";
import { PaymentBar } from "./components/payment-bar";
import "./_payment-campaign.scss";
interface Props {}

export const PaymentCampaign: React.FC<Props> = () => {
  const [tab, setTab] = React.useState<string>("BankCard");
  const CurrentConfirmation = PAYMENT_CAMPAIGN_TABS.find(
    (tb) => tab === tb.id
  )?.component;
  const currency = [{ name: "UK" }, { name: "EU" }, { name: "International" }];
  return (
    <Container className="payment-campaign">
      <PaymentBar data={PAYMENT_CAMPAIGN_TABS} tab={tab} onChange={setTab} />
      <div className="payment-campaign__form">
        {tab === "BankTransfer" && (
          <ul className="ul-BankTransfer">
            {currency.map((cr, i) => (
              <li key={i}>{cr.name}</li>
            ))}
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
            {CurrentConfirmation && <CurrentConfirmation />}
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
    </Container>
  );
};
