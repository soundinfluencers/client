import { CountryAutocomplete } from "@components/ui/country-autocomplete/CountryAutocomplete.tsx";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

interface Props {
  name: string;
  placeholder?: string;
  label?: string;
}

export const CountryField: React.FC<Props> = ({
  name,
  placeholder,
  label,
}) => {
  const { control, setValue, clearErrors } = useFormContext();
  const { field, fieldState } = useController({ control, name });

  return (
    <CountryAutocomplete
      value={field.value}
      name={name}
      placeholder={placeholder}
      label={label}
      error={fieldState.error}
      onInputChange={() => clearErrors(name)}
      onCommit={(val) => {
        setValue(name, val, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
    />
  );
};