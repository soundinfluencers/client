
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";
import {PhoneInput} from "@/features/auth/sign-up-client/ui/input-helpers/phone-input/phone-input.tsx";


interface PhoneFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneField<T extends FieldValues>({
  name,
  label,
  placeholder,
  disabled,
}: PhoneFieldProps<T>) {
  const { control } = useFormContext<T>();

  const {
    field: { value, onChange, onBlur, ref },
    fieldState,
  } = useController({
    name,
    control,
  });

  return (
    <PhoneInput
      ref={ref}
      name={String(name)}
      value={value ?? ""}
      placeholder={placeholder}
      label={label}
      error={fieldState?.error?.message}
      disabled={disabled}
      onChange={(nextValue) => onChange(nextValue)}
      onBlur={onBlur}
    />
  );
}
