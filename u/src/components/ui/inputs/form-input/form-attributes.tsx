import React from "react";
import "./_form-attributes.scss";
import {
  get,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
interface FormInput<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  id?: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  className?: string;
  validation?: RegisterOptions;
}
interface FormTextArea<T extends FieldValues> {
  name: Path<T>;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  isBespoke?: boolean;
}

// input for form //

export const FormInput = React.forwardRef<HTMLInputElement, FormInput<any>>(
  ({
    name,
    label,
    placeholder,
    required = false,
    type = "text",
    className = "",
    validation,
    id,
  }) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const error = get(errors, name)?.message as string;

    return (
      <div className={`form-input ${className} ${error ? "error" : ""}`}>
        {label && <label htmlFor={String(name)}>{label}</label>}

        <input
          id={String(name)}
          type={type}
          placeholder={placeholder}
          {...register(name, { required, ...validation })}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
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
}: FormTextArea<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name)?.message as string;
  return (
    <div className={`form-field  ${className} ${error ? "error" : ""}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        id={name}
        {...register(name as any, { required })}
        placeholder={placeholder}
        className={isBespoke ? "bespoke" : ""}
      />
    </div>
  );
}

// also can be added a new one //
