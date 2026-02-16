import type { IBespokeCampaignTabData } from "@/shared/types/client/form-clients/bespoke-campaign-tabs-data";
import { z } from "zod";

const urlRegex = /^https?:\/\/\S+/i;

const isUrlField = (name: string) => {
  const lower = name.toLowerCase();
  return (
    lower.includes("link") ||
    lower.includes("links") ||
    lower.includes("storytag")
  );
};

export const buildPromoTabSchema = (tab: IBespokeCampaignTabData) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  tab.inputs?.forEach((i) => {
    const isOptional = i.name === "Target territories";

    shape[i.name] = isOptional
      ? z.string().trim().optional().or(z.literal(""))
      : z.string().trim().min(1, "This field is required");
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
