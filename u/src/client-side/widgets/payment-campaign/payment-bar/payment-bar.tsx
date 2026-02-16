import React from "react";
import "./_payment-bar.scss";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";

export type PaymentTab = {
  id: PaymentTabId;
  label: string;
  icon: string;
  component: React.FC<any>;
};

interface Props {
  data: readonly PaymentTab[];
  tab: PaymentTabId;
  onChange: (nextTab: PaymentTabId) => void;
}

export const PaymentBar: React.FC<Props> = ({ tab, onChange, data }) => {
  return (
    <ul className="ul-bar">
      {data.map((tb) => (
        <li
          key={tb.id}
          className={tab === tb.id ? "active" : ""}
          onClick={() => onChange(tb.id)}>
          <img src={tb.icon} alt="" />
          <h3>{tb.label}</h3>
        </li>
      ))}
    </ul>
  );
};
