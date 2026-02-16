import { INVOICE_PAYMENT_METHODS_TABS } from './data/payment-method.data';
import type { TInvoicePaymentMethod } from './types/payment-method.types';
import './_payment-bar.scss'

interface Props {
  tab: TInvoicePaymentMethod;
  onChange: (tab: TInvoicePaymentMethod) => void;
  className?: string;
}

export const PaymentBar = ({
 tab,
 onChange,
 className = '',
}: Props) => {
  return (
    <ul className={`payment-list ${className ? className : ''}`}>
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