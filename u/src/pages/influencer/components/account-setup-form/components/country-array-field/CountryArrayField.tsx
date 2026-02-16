import { useController, useFormContext, useWatch } from "react-hook-form";
import React, { useMemo } from "react";
import { CountryAutocomplete } from "@components/ui/country-autocomplete/CountryAutocomplete.tsx";

interface Props {
  index: number;
  placeholder?: string;
}

export const CountryArrayField: React.FC<Props> = ({ index, placeholder }) => {
  const { control, setValue } = useFormContext();
  const name = `countries.${index}.country` as const;

  const { field } = useController({ control, name });

  const allCountries = useWatch({ control, name: "countries" }) as Array<{ country: string | null }> | undefined;

  const exclude = useMemo(() => {
    const s = new Set<string>();
    (allCountries ?? []).forEach((item, i) => {
      if (i === index) return;
      if (item?.country) s.add(item.country);
    });
    return s;
  }, [allCountries, index]);

  return (
    <CountryAutocomplete
      size={'small'}
      value={field.value}
      placeholder={placeholder}
      // error={fieldState.error}
      excludeCountries={exclude}
      onCommit={(val) => {
        setValue(name, val, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
    />
  );
};