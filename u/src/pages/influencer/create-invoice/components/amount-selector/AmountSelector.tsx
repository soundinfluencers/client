import React from "react";
import { useUser } from "@/store/get-user";
import './_amount-selector.scss';

export interface AmountSelectorProps {
  select: 'balance' | 'other';
  onSelect: (value: 'balance' | 'other') => void;
}

export const AmountSelector: React.FC<AmountSelectorProps> = ({ select, onSelect }) => {
  const { user } = useUser();

  return (
    <div className="amount-selector">
      <p className="amount-selector__label">Amount</p>

      <div className="amount-selector__options">
        <div className="amount-selector__option">
          <input
            id="balance"
            name="balance"
            type="radio"
            value={'balance'}
            checked={select === 'balance'}
            onChange={() => onSelect('balance')}
            className={`amount-selector__input ${select === 'other' ? 'amount-selector__input--disabled' : ''}`}
          />
          <label htmlFor="balance" className="amount-selector__label-balance">
            Total Balance
            <span>{user?.balance} €</span>
          </label>
        </div>

        <div className="amount-selector__option">
          <input
            id="other"
            name="other"
            type="radio"
            value={'other'}
            checked={select === 'other'}
            onChange={() => onSelect('other')}
            className={`amount-selector__input ${select === 'balance' ? 'amount-selector__input--disabled' : ''}`}
          />
          <label htmlFor="other" className="amount-selector__label-other">
            Other Amount
          </label>
        </div>
      </div>
    </div>
  );
};