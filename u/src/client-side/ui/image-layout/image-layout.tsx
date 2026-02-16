import { useLocalProfileStore } from "@/client-side/store/mock-photo/mock-photo";
import { ImageUpload } from "@/components";
import { Controller, useFormContext } from "react-hook-form";

export function RHFImageUpload({
  name,
  label,
  placeholder,
  description,
  size,
}: {
  name: "avatarUrl"; // или string
  label: string;
  placeholder: string;
  description?: string;
  size: "small" | "large";
}) {
  const { control } = useFormContext();
  const { setAvatar } = useLocalProfileStore();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ImageUpload
          name={name}
          label={label}
          placeholder={placeholder}
          size={size}
          value={field.value ?? null}
          onChange={(url) => {
            setAvatar(url);
          }}
          error={fieldState.error}
        />
      )}
    />
  );
}
