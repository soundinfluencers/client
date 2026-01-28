import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import './_percentage-input.scss';

interface Props {
  placeholder: string;
  index: number;
};

export const PercentageInput: React.FC<Props> = ({ placeholder, index }) => {
  const { control } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <Controller
      control={control}
      name={`countries.${index}.percentage`}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;
        const displayValue = isFocused ? draft : field.value != null ? `${field.value}%` : '';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value.replace(',', '.');

          // allow: "", ".", "12", "12.", "12.3", "12.34"
          if (!/^\d{0,3}(\.\d{0,2})?$/.test(val)) return;

          if (Number(val) > 100) return;

          setDraft(val);
        };

        const handleBlur = () => {
          setIsFocused(false);
          field.onBlur();

          if (draft === '' || draft === '.') {
            field.onChange(null);
            setDraft('');
            return;
          }

          const num = Math.min(100, Number(draft));
          field.onChange(num);
          setDraft(String(num));
        };

        const handleFocus = () => {
          setIsFocused(true);
          setDraft(field.value != null ? String(field.value) : '');
        };

        return (
          <input
            type="text"
            inputMode='decimal'
            className={`percentage-input ${hasError ? "percentage-input--error" : ""}`}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        );
      }}
    />
  );
};