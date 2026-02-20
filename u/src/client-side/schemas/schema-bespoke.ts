import type { IBespokeCampaignTabData } from "@/shared/types/client/form-clients/bespoke-campaign-tabs-data";
import { z } from "zod";

const urlRegex = /^https?:\/\/\S+/i;

const REQUIRED_FIELDS = new Set([
  "Campaign objective",
  "Content available",
  "Your budget",
]);

const BUDGET_FIELDS = new Set(["Your budget"]);

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

    // BUDGET: required + currency required
    if (BUDGET_FIELDS.has(name)) {
      shape[name] = z
        .string()
        .trim()
        .min(1, "Budget is required")
        .refine((v) => {
          const cleaned = v.replace(",", ".");
          return cleaned !== "" && !isNaN(Number(cleaned));
        }, "Budget must be a number");

      shape["Your budget currency"] = z.enum(["£", "$", "€"]);
      return;
    }

    // REQUIRED fields
    if (REQUIRED_FIELDS.has(name)) {
      shape[name] = z.string().trim().min(1, "This field is required");
      return;
    }

    // ALL OTHER inputs: optional (allow empty)
    shape[name] = z.string().trim().optional().or(z.literal(""));
  });

  tab.textAreas?.forEach((t) => {
    // ALL textareas optional (allow empty)
    shape[t.name] = z.string().trim().optional().or(z.literal(""));
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
