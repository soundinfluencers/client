import './_influencer-date-input.scss';

import React from "react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
};

export const InfluencerDateInput: React.FC<Props> = ({
  name,
  label = "Date post",
  placeholder = "dd/mm/yyyy",
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <div className='influencer-date-input'>
            <label htmlFor={name} className={`influencer-date-input__label ${hasError ? "influencer-date-input__label--error" : ""}`}>{label}</label>
            <input
              type="text"
              className={`influencer-date-input__field ${hasError ? "influencer-date-input__field--error" : ""}`}
              inputMode="numeric"
              autoComplete="off"
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(formatDateDDMMYYYY(e.target.value))}
              onBlur={field.onBlur}
            />

            {/* {fieldState.error?.message && (
              <p className="influencer-date-input__error-message">{fieldState.error.message}</p>
            )} */}
          </div>
        );
      }}
    />
  );
};

export const formatDateDDMMYYYY = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);

  let out = d;
  if (m) out += `/${m}`;
  if (y) out += `/${y}`;

  return out;
};