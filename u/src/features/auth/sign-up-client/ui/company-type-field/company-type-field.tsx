import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import {CompanyTypeSelect} from "@/features/auth/sign-up-client/ui/company-type-select";


interface CompanyTypeFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CompanyTypeField<T extends FieldValues>({
  name,
  label,
  placeholder,
  disabled,
}: CompanyTypeFieldProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  return (
    <CompanyTypeSelect
      name={String(name)}
      value={value ?? null}
      placeholder={placeholder}
      label={label}
      error={fieldState?.error?.message}
      disabled={disabled}
      onCommit={onChange}
      onBlur={onBlur}
    />
  );
}
