import './_payment-bar.scss'
import {INVOICE_PAYMENT_METHODS_TABS } from "../../../../../constants/influencer/form-data/invoice/invoice-payment.data";
import type { TInvoicePaymentMethod } from '../../../../../types/influencer/form/invoice/payment-method.types';

interface Props {
  tab: TInvoicePaymentMethod;
  onChange: (tab: TInvoicePaymentMethod) => void;
}

export const PaymentBar = ({ tab, onChange }: Props) => {
  return (
    <ul className="payment-list">
      {INVOICE_PAYMENT_METHODS_TABS.map((tb) => (
        <li
          key={tb.id}
          className={`payment-list__item ${tab === tb.id ? "payment-list__item--active" : ""}`}
          onClick={() => onChange(tb.id)}
        >
          <img className='payment-list__item-image' src={tb.icon} alt={tb.label} />
          <p className='payment-list__item-label'>{tb.label}</p>
        </li>
      ))}
    </ul>
  );
};