import React from "react";
import "./_payment-bar.scss";
interface Props {
  data: any[];
  tab: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

export const PaymentBar: React.FC<Props> = ({ tab, onChange, data }) => {
  return (
    <ul className="ul-bar">
      {data.map((tb) => (
        <li
          className={tab === tb.id ? "active" : ""}
          onClick={() => onChange(tb.id)}
          key={tb.id}>
          <img src={tb.icon} alt="" />
          <h3>{tb.label}</h3>
        </li>
      ))}
    </ul>
  );
};
