import React from "react";
import "./_form-attributes.scss";
import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
interface FormInput<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder: string;
  register: UseFormRegister<T>;
  required?: boolean;
  type?: string;
  className?: string;
  error?: FieldError;
}
interface FormTextArea<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  required?: boolean;
  className?: string;
  error?: FieldError;
  isBespoke?: boolean;
}

// input for form //

export function FormInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  register,
  required = false,
  type = "text",
  className = "",
  error,
}: FormInput<T>) {
  return (
    <div className={`form-input ${className} ${error ? "error" : ""}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        {...register(name, { required })}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}

// textarea for form //

export function FormTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  register,
  required = false,
  error,
  className = "",
  isBespoke,
}: FormTextArea<T>) {
  return (
    <div className={`form-field  ${className} ${error ? "error" : ""}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        id={name}
        {...register(name, { required })}
        placeholder={placeholder}
        className={isBespoke ? "bespoke" : ""}
      />
    </div>
  );
}

// also can be added a new one //
