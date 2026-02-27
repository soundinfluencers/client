import type { IBespokeCampaignTabData } from "@/types/client/form-clients/bespoke-campaign-tabs-data";
import { z } from "zod";

type Category = "artist" | "music" | "event" | "other";
type Values = Record<string, any>;

const REQUIRED_FIELDS: Record<Category, string[]> = {
  artist: ["Campaign objective", "Content available", "Your budget"],
  music: ["Content available", "Your budget"],
  event: ["Content available", "Your budget"],
  other: ["Brief"],
};

const parseAmount = (v: any) => {
  const s = String(v ?? "");
  const numeric = s
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  return numeric ? Number(numeric) : 0;
};

const isEmpty = (v: any) =>
  v == null || (typeof v === "string" && v.trim().length === 0);

// Бюджет: приводим к number и валидируем > 0
const budgetSchema = z.preprocess(
  (v) => parseAmount(v),
  z.number().gt(0, "Budget is required."),
);

// Все возможные поля (можешь добавлять новые — просто допиши тут ключ)
const baseBespokeSchema = z.object({
  ["Campaign objective"]: z.string().optional(),
  ["Content available"]: z.string().optional(),
  ["Your budget"]: z.any().optional(),
  ["Your budget currency"]: z.string().optional(), // если у тебя реально есть это поле
  ["Target territories"]: z.string().optional(),
  ["Any Extra Briefs"]: z.string().optional(),

  ["Download or private link to the track"]: z.string().optional(),
  ["Release date"]: z.string().optional(),
  ["Enter linkfire / smartlink"]: z.string().optional(),
  ["What you’re promoting (Campaign Goal)"]: z.string().optional(),
  ["Ticket link"]: z.string().optional(),

  ["Any extra notes (messaging, influencer type, content ideas)"]: z
    .string()
    .optional(),

  ["Brief"]: z.string().optional(),
});

export const buildBespokeSchema = (category: Category) =>
  baseBespokeSchema.superRefine((values, ctx) => {
    // required поля (кроме бюджета — он отдельно)
    for (const field of REQUIRED_FIELDS[category]) {
      if (field === "Your budget") continue;

      if (isEmpty(values[field])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Required.",
        });
      }
    }

    // required бюджет (если в списке required)
    if (REQUIRED_FIELDS[category].includes("Your budget")) {
      const res = budgetSchema.safeParse(values["Your budget"]);
      if (!res.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["Your budget"],
          message: res.error.issues[0]?.message ?? "Budget is required.",
        });
      }
    }

    // пример “расширения по необходимости”:
    // если указан trackLink — тогда Release date обязателен
    if (
      category === "music" &&
      !isEmpty(values["Download or private link to the track"]) &&
      isEmpty(values["Release date"])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["Release date"],
        message: "Release date is required when track link is provided.",
      });
    }
  });

export const buildPromoTabDefaultValues = (tab: IBespokeCampaignTabData) => {
  const defaults: Record<string, any> = {};

  tab.inputs?.forEach((i) => {
    defaults[i.name] = "";

    if (i.name === "Your budget") {
      defaults["Your budget currency"] = "£";
    }
  });

  tab.textAreas?.forEach((t) => {
    defaults[t.name] = "";
  });

  return defaults;
};
