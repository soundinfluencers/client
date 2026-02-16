import React, { useState } from 'react';
import { useFormContext, Controller, useController, useWatch } from "react-hook-form";
import { normalizePriceLabel } from './utils/normalize-price-label';
import type { ProfileCurrency, TSocialAccounts } from '@/types/user/influencer.types';

import './_price-input.scss';

export const PriceInput = ({ platform }: { platform: TSocialAccounts }) => {
  const { control } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const currency: ProfileCurrency = useWatch({ control, name: 'currency' });
  const currencySymbol =
    currency === "GBP" ? "\u00A3" : currency === "USD" ? "\u0024" : "\u20AC";

  return (
    <Controller
      name="price"
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error;
        const displayValue = isFocused ? draft : field.value != null ? `${field.value}${currencySymbol}` : '';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value.replace(/\D/g, '');

          setDraft(val);
        };

        const handleFocus = () => {
          setIsFocused(true);
          setDraft(field.value != null ? String(field.value) : '');
        };

        const handleBlur = () => {
          setIsFocused(false);

          if (!draft) {
            field.onChange(null);
            setDraft('');
            return;
          }

          const num = Math.max(0, Number(draft));
          field.onChange(num);
          setDraft(String(num));
        };

        return (
          <div className="price-input">
            <label htmlFor="price" className={`price-input__label ${error ? 'price-input__label--error' : ''}`}>
              {normalizePriceLabel(platform)}
            </label>

            <CurrencySelector/>

            <input
              id="price"
              className={`price-input__input ${error ? 'price-input__input--error' : ''}`}
              type="text"
              placeholder={`100${currencySymbol}`}
              value={displayValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {error && <p className="price-input__error-message">{error.message}</p>}
          </div>
        );
      }}
    />
  );
};

const CurrencySelector = () => {
  const { control } = useFormContext();

  const { field } = useController({
    name: "currency",
    control,
  });

  return (
    <div className="currency-selector">
      {CURRENCIES.map((currency) => (
        <label
          htmlFor={currency.value}
          className={`currency-selector__option ${field.value === currency.value ? 'currency-selector__option--selected' : ''}`}
          key={currency.value}
        >
          <input
            type="radio"
            id={currency.value}
            value={currency.value}
            checked={field.value === currency.value}
            onChange={() => field.onChange(currency.value)}
            className="currency-selector__input"
          />
          <span className="currency-selector__label">
            {currency.label}
        </span>
        </label>
      ))}
    </div>
  );
};

const CURRENCIES = [
  { label: '\u00A3', value: 'GBP' },
  { label: '\u0024', value: 'USD' },
  { label: '\u20AC', value: 'EUR' },
];