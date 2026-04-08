import type { ProfileCategory, SocialAccountDraft, TSocialAccounts } from "@/types/user/influencer.types.ts";

type FieldKey = keyof SocialAccountDraft;

type FieldType = "text" | "link" | "chips" | "countries" | "price" | "stringChips";

type When = {
  category?: ProfileCategory;
  notCategory?: ProfileCategory;
};

export type CardField = {
  key: FieldKey;
  label: string;
  type?: FieldType;
  when?: When;
};

export type FieldsConfig = Record<TSocialAccounts, CardField[]>;
