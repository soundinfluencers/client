import './_price-input.scss';

import { useFormContext, Controller } from "react-hook-form";
import { useState } from 'react';
import { normalizePriceLabel } from './utils/normalize-price-label';
import type { TSocialAccounts } from '@/types/user/influencer.types';

//TODO: need add validation
export const PriceInput = ({ platform }: { platform: TSocialAccounts }) => {
  const { control } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <Controller
      name="price"
      control={control}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;
        const displayValue = isFocused ? draft : field.value != null ? `${field.value}€` : '';

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
            <label htmlFor="price" className={`price-input__label ${hasError ? 'price-input__label--error' : ''}`}>
              {normalizePriceLabel(platform)}
            </label>
            <input
              id="price"
              className={`price-input__input ${hasError ? 'price-input__input--error' : ''}`}
              type="text"
              placeholder="100€"
              value={displayValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        );
      }}
    />
  );
};