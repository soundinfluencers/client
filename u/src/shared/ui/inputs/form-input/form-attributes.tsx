import React from "react";
import "./_form-attributes.scss";
import {
  Controller,
  get,
  useController,
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
  validation?: RegisterOptions; // доп rules поверх zod
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
      id,
      validation,
    },
    ref,
  ) => {
    const {
      control,
      formState: { errors, touchedFields, submitCount },
    } = useFormContext();

    const errorMsg =
      (get(errors, name)?.message as string | undefined) ?? undefined;

    const showError =
      !!errorMsg && (get(touchedFields, name) || submitCount > 0);

    return (
      <Controller
        control={control}
        name={name}
        rules={validation}
        render={({ field, fieldState }) => {
          const hasError = fieldState.invalid;
          return (
            <div
              className={`form-input ${className} ${hasError ? "is-error" : ""}`}>
              {label && (
                <label htmlFor={id ?? name}>
                  {label}
                  {required ? "*" : ""}
                </label>
              )}

              <input
                id={id ?? name}
                type={type}
                placeholder={placeholder}
                value={field.value ?? ""}
                onChange={(e) => {
                  field.onChange(
                    type === "number" ? Number(e.target.value) : e.target.value,
                  );
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={(el) => {
                  field.ref(el);
                  if (typeof ref === "function") ref(el);
                  else if (ref)
                    (
                      ref as React.MutableRefObject<HTMLInputElement | null>
                    ).current = el;
                }}
              />

              {showError && <p className="form-input__error">{errorMsg}</p>}
            </div>
          );
        }}
      />
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
