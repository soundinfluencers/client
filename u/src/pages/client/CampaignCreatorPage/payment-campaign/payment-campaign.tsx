import React from "react";
import { PaymentBar } from "./components/payment-bar";
import { Container } from "../../../../components/container/container";
import { PAYMENT_CAMPAIGN_TABS_INPUTS } from "../../../../constants/payment-campaign-tabs.inputs";
import Form from "../../../../components/form/form";
import "./_payment-campaign.scss";
import { PAYMENT_CAMPAIGN_TABS } from "../../../../constants/payment-campaign-tabs";
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
          className="payment-campaign__width"
          paymentData={PAYMENT_CAMPAIGN_TABS_INPUTS}></Form>
        <div className="payment-campaign__confirmation">
          {CurrentConfirmation && <CurrentConfirmation />}
        </div>
      </div>
    </Container>
  );
};
