import React from "react";
import "./_form-attributes.scss";
import {
  get,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  id?: string;
  placeholder: string;
  required?: boolean; // только для UI
  type?: string;
  className?: string;
  validation?: RegisterOptions; // опционально: доп rules поверх zod
}
interface FormTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean; // только UI
  className?: string;
  isBespoke?: boolean;
  validation?: RegisterOptions;
}

// input for form //

export const FormInput = React.forwardRef<
  HTMLInputElement,
  FormInputProps<any>
>(
  (
    {
      name,
      label,
      placeholder,
      required = false,
      type = "text",
      className = "",
      validation,
      id,
    },
    ref,
  ) => {
    const {
      register,
      formState: { errors, touchedFields, submitCount },
    } = useFormContext();

    const errorMsg =
      (get(errors, name)?.message as string | undefined) ?? undefined;
    const showError =
      !!errorMsg && (get(touchedFields, name) || submitCount > 0);

    return (
      <div className={`form-input ${className} ${showError ? "is-error" : ""}`}>
        {label && (
          <label htmlFor={id ?? name}>
            {label} {required ? "*" : ""}
          </label>
        )}

        <input
          id={id ?? name}
          type={type}
          placeholder={placeholder}
          {...register(name, validation)} // ✅ zod делает основную валидацию
        />

        {showError && <p className="form-input__error">{errorMsg}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

// textarea for form //

export function FormTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  required = false,
  className = "",
  isBespoke,
  id,
  validation,
}: FormTextAreaProps<T>) {
  const {
    register,
    formState: { errors, touchedFields, submitCount },
  } = useFormContext();

  const errorMsg =
    (get(errors, name)?.message as string | undefined) ?? undefined;
  const showError = !!errorMsg && (get(touchedFields, name) || submitCount > 0);

  return (
    <div className={`form-field ${className} ${showError ? "error" : ""}`}>
      {label && (
        <label htmlFor={id ?? name}>
          {label} {required ? "*" : ""}
        </label>
      )}

      <textarea
        id={id ?? name}
        placeholder={placeholder}
        className={isBespoke ? "bespoke" : ""}
        {...register(name as any, validation)}
      />

      {showError && <p className="form-input__error">{errorMsg}</p>}
    </div>
  );
}

// also can be added a new one //
