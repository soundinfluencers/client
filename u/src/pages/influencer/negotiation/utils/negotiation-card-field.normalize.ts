import type { CardField } from "@/pages/influencer/negotiation/types/negotiation.config.types.ts";
import type { ProfileCategory } from "@/types/user/influencer.types.ts";

export const isFieldVisible = (field: CardField, category: ProfileCategory) => {
  if (!field.when) return true;
  if (field.when.category && field.when.category !== category) return false;
  if (field.when.notCategory && field.when.notCategory === category) return false;
  return true;
};

