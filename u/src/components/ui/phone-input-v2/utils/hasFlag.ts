import { FLAG_ICONS_SUPPORTED } from "@components/ui/phone-input-v2/data/flag-icon.ts";

export const hasFlag = (iso2?: string): boolean => {
  if (!iso2) return false;
  return FLAG_ICONS_SUPPORTED.has(iso2.toLowerCase());
};