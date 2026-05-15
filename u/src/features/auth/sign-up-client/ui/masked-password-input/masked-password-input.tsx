import { useState } from "react";
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form";

import clsx from "clsx";

import eye from '@/assets/icons/eye.svg';
import closeEye from '@/assets/icons/eye-off.svg';

import styles from './masked-password-input.module.scss';
import {Input} from "@/features/auth/sign-up-client/ui/input/input.tsx";

interface MaskedPasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function MaskedPasswordInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
  disabled = false,
}: MaskedPasswordInputProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({
    name,
    control,
  });

  const [isVisible, setIsVisible] = useState(false);
  const hasValue = Boolean(value?.toString()?.length);

  return (
    <Input
      id={name}
      name={name}
      ref={ref}
      label={label}
      type={isVisible ? "text" : "password"}
      value={(value ?? "") as string}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      error={fieldState.error?.message}
      onChange={onChange}
      onBlur={onBlur}
      rightSlot={
        hasValue ? (
          <button
            className={clsx(styles.showBtn)}
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
          >
            <img
              src={isVisible ? closeEye : eye}
              alt={isVisible ? "Hide password" : "Show password"}
            />
          </button>
        ) : null
      }
    />
  );
}
