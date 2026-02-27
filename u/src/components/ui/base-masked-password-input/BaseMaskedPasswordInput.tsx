import { useState } from "react";
import type { FieldValues, Path } from "react-hook-form";
import { useController, useFormContext } from "react-hook-form";

import eye from "../../../assets/password-icon/eye.svg";
import closeEye from "../../../assets/password-icon/eye-off.svg";

import "./_base-masked-password-input.scss";

interface BaseMaskedPasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function BaseMaskedPasswordInput<T extends FieldValues>({
name,
label,
placeholder,
autoComplete,
disabled = false,
}: BaseMaskedPasswordInputProps<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control });

  const [isVisible, setIsVisible] = useState(false);
  const hasValue = Boolean(field.value?.toString()?.length);

  return (
    <div className="base-masked-password-input">
      <label
        htmlFor={name}
        className={`base-masked-password-input__label ${
          fieldState.error ? "base-masked-password-input__label--error" : ""
        }`}
      >
        {label}
      </label>

      <input
        id={name}
        name={field.name}
        ref={field.ref}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`base-masked-password-input__input ${
          fieldState.error ? "base-masked-password-input__input--error" : ""
        }`}
        value={(field.value ?? "") as string}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
      />

      {hasValue && (
        <img
          src={isVisible ? closeEye : eye}
          alt={isVisible ? "Hide password" : "Show password"}
          className="base-masked-password-input__input__icon"
          onClick={() => setIsVisible((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsVisible((v) => !v);
          }}
        />
      )}

      {fieldState.error?.message && (
        <p className="base-masked-password-input__error-message">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}