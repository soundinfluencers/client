import { formatCurrency } from "@/pages/influencer/create-bundle/shared/libs/format-currency.ts";


import s from './bundle-total-price.module.scss';


interface BundleTotalPriceProps {
  value: number;
}

export const BundleTotalPrice = ({
  value,
}: BundleTotalPriceProps) => {
  return (
    <div className={s.totalPrice}>
      <span>Total price:</span>
      <span className={s.price}>{formatCurrency(value, "EUR")}</span>
    </div>
  );
};
