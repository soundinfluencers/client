import { useEffect, useState } from "react";
import { useFormContext, type Path, useController, type FieldValues } from "react-hook-form";
import './_base-input.scss';

type BaseInputType = "text" | "number" | "email" | "password" | "numeric";

interface BaseInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: BaseInputType;
  disabled?: boolean;
}

const sanitizeDigits = (raw: string) => raw.replace(/\D/g, "");
const sanitizeNumber = (raw: string) => {
  let s = raw.replace(/,/g, ".").replace(/[^\d.-]/g, "");

  s = s.replace(/(?!^)-/g, "");

  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  return s;
};

export function BaseInput<T extends FieldValues>({
                                                   name,
                                                   label,
                                                   placeholder,
                                                   type = "text",
                                                   disabled = false,
                                                 }: BaseInputProps<T>) {
  const { control, setValue, getValues, clearErrors } = useFormContext<T>();

  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error;

  const isNumeric = type === "number" || type === "numeric";

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (!isNumeric) return;

    const v = field.value as unknown;

    if (v === null || v === undefined || v === "") {
      setDisplayValue("");
      return;
    }

    setDisplayValue(String(v));
  }, [field.value, isNumeric]);

  const commitNumericToForm = (raw: string) => {
    if (raw === "" || raw === "-" || raw === ".") {
      field.onChange(null);
      return;
    }

    const num = Number(raw);
    field.onChange(Number.isFinite(num) ? num : null);
  };

  if (!isNumeric) {
    return (
      <div className="base-input">
        {label && (
          <label
            className={`base-input__label ${error ? "base-input__label--error" : ""}`}
            htmlFor={name}
          >
            {label}
          </label>
        )}

        <input
          className={`base-input__field ${error ? "base-input__field--error" : ""}`}
          ref={field.ref}
          name={name}
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
        <p className={`base-input__error-message ${
            error ? 'base-input__error-message--show' : ''
          }`}
           aria-live="polite"
        >
          {error?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="base-input">
      {label && (
        <label
          className={`base-input__label ${error ? "base-input__label--error" : ""} ${disabled ? "base-input__label--disabled" : ""}`}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        className={`base-input__field ${error ? "base-input__field--error" : ""}`}
        ref={field.ref}
        placeholder={placeholder}
        type={'text'}
        inputMode={'numeric'}
        disabled={disabled}
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value;

          if (type === 'numeric' && /\D/.test(raw)) {
            // if non-digit characters are present, ignore the change
            return;
          }

          const next = type === "numeric" ? sanitizeDigits(raw) : sanitizeNumber(raw);

          setDisplayValue(next);
          clearErrors(name);
          commitNumericToForm(next);
        }}
        onBlur={() => {
          setValue(name, getValues(name), {
            shouldTouch: true,
            shouldValidate: false,
          });
        }}
      />
      <p className={`base-input__error-message ${
          error ? 'base-input__error-message--show' : ''
        }`}
         aria-live="polite"
      >
        {error?.message}
      </p>
    </div>
  );
}
