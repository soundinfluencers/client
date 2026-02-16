import type { IBespokeCampaignTabData } from "@/shared/types/client/form-clients/bespoke-campaign-tabs-data";
import { z } from "zod";

const urlRegex = /^https?:\/\/\S+/i;

const OPTIONAL_FIELDS = new Set(["Target territories"]);

const BUDGET_FIELDS = new Set(["Your budget"]);

const DATE_FIELDS = new Set(["Release date"]);

const SMARTLINK_FIELD_NAMES = new Set([
  "Linkfire / smartlink",
  "Enter linkfire / smartlink",
]);

const isUrlField = (name: string) => {
  const lower = name.toLowerCase();
  return (
    lower.includes("link") ||
    lower.includes("links") ||
    lower.includes("smartlink") ||
    SMARTLINK_FIELD_NAMES.has(name)
  );
};

export const buildPromoTabSchema = (tab: IBespokeCampaignTabData) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  tab.inputs?.forEach((i) => {
    const name = i.name;

    if (OPTIONAL_FIELDS.has(name)) {
      shape[name] = z.string().trim().optional().or(z.literal(""));
      return;
    }

    if (BUDGET_FIELDS.has(name)) {
      shape[name] = z
        .string()
        .trim()
        .min(1, "Budget is required")
        .refine((v) => !isNaN(Number(v)), "Budget must be a number");
      return;
    }

    if (DATE_FIELDS.has(name)) {
      shape[name] = z
        .string()
        .trim()
        .min(1, "Release date is required")
        .refine((v) => !isNaN(Date.parse(v)), "Enter a valid date");
      return;
    }

    shape[name] = z.string().trim().min(1, "This field is required");
  });

  tab.textAreas?.forEach((t) => {
    shape[t.name] = z.string().trim().min(1, "This field is required");
  });

  return z.object(shape).superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      const v = String(value ?? "").trim();
      if (!v) continue;

      if (isUrlField(key) && !urlRegex.test(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "Enter a valid URL (https://...)",
        });
      }
    }
  });
};

export const buildPromoTabDefaultValues = (tab: IBespokeCampaignTabData) => {
  const defaults: Record<string, string> = {};

  tab.inputs?.forEach((i) => {
    defaults[i.name] = "";
  });

  tab.textAreas?.forEach((t) => {
    defaults[t.name] = "";
  });

  return defaults;
};
