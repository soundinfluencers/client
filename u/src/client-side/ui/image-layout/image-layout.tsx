import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useLocalProfileStore } from "@/client-side/store/mock-photo/mock-photo";
import { ImageUpload } from "@/components";
export function RHFImageUpload(props: {
  name: "logoUrl";
  label: string;
  placeholder: string;
  description?: string;
  size: "small" | "large";
}) {
  const value: unknown = useWatch({ name: props.name });
  const setAvatar = useLocalProfileStore((state) => state.setAvatar);
  useEffect(() => {
    setAvatar(typeof value === "string" ? value : null);
  }, [value, setAvatar]);
  return <ImageUpload {...props} />;
}
