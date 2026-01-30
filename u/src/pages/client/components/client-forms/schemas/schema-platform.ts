import { z } from "zod";

const urlRegex = /^https?:\/\/[^\s]+$/;

export const campaignPostContentSchema: z.ZodType<Record<string, string>> = z
  .record(z.string(), z.string())
  .superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      const v = (value ?? "").trim();

      if (!v) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "This field is required",
        });
        continue;
      }

      const lower = key.toLowerCase();
      const looksLikeUrlField =
        lower.includes("link") ||
        lower.includes("links") ||
        lower.includes("storytag");

      if (looksLikeUrlField && !urlRegex.test(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "Enter a valid URL (https://...)",
        });
      }
    }
  });
