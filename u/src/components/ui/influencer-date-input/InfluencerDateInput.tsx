import './_influencer-date-input.scss';

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { formatDateDDMMYYYY } from "@components/ui/influencer-date-input/utils/formatDate.ts";

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
        const error = fieldState.error;

        return (
          <div className='influencer-date-input'>
            <label htmlFor={name} className={`influencer-date-input__label ${error ? "influencer-date-input__label--error" : ""}`}>{label}</label>
            <input
              id={name}
              type="text"
              className={`influencer-date-input__field ${error ? "influencer-date-input__field--error" : ""}`}
              inputMode="numeric"
              autoComplete="off"
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(formatDateDDMMYYYY(e.target.value))}
              onBlur={field.onBlur}
            />

            {error && (
              <p className="influencer-date-input__error-message">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};

