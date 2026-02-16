import { z } from "zod";
import {
  ENTERTAINMENT_CATEGORIES_DATA, MUSIC_CATEGORIES_DATA,
} from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/creator-categories.data.ts";

const pickValues = (data: Array<{ value: string }>) => data.map((x) => x.value);

const ENTERTAINMENT_SET = new Set(pickValues(ENTERTAINMENT_CATEGORIES_DATA));
const MUSIC_SET = new Set(pickValues(MUSIC_CATEGORIES_DATA));

export const creatorCategoriesSchema = z
.array(z.string())
.superRefine((values, ctx) => {
  const arr = Array.isArray(values) ? values : [];

  const hasEntertainment = arr.some((v) => ENTERTAINMENT_SET.has(v));
  const hasMusic = arr.some((v) => MUSIC_SET.has(v));

  if (!hasEntertainment || !hasMusic) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Select at least one option", // You didn't select any option.
    });
  }
});
