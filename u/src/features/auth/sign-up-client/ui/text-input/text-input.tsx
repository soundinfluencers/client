import React from "react";
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import {Input} from "@/features/auth/sign-up-client/ui/input/input.tsx";


interface BaseTextInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
}

export function TextInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete = 'off',
  disabled = false,
}: BaseTextInputProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  return (
    <Input
      id={name}
      name={name}
      ref={ref}
      label={label}
      type={type}
      value={(value ?? "") as string}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  );
}
