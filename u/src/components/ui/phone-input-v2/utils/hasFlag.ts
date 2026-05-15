import {FLAG_ICONS_SUPPORTED} from "@/features/auth/sign-up-client/ui/input-helpers/model/phone-countries.ts";


export const hasFlag = (iso2?: string): boolean => {
  if (!iso2) return false;
  return FLAG_ICONS_SUPPORTED.has(iso2.toLowerCase());
};