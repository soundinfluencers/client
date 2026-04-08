import { z } from "zod";

export type CampaignPostContentFormValues = Record<string, string>;

const normalizeString = z.preprocess((value) => {
  if (value === undefined || value === null) return "";
  return String(value);
}, z.string());


const isValidLink = (value: string) => {
  const v = value.trim();

  if (!v) return false;
  if (/\s/.test(v)) return false;

  return (
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("www.") ||
      v.includes(".")
  );
};

export const campaignPostContentSchema: z.ZodType<CampaignPostContentFormValues> =
    z.record(z.string(), normalizeString).superRefine((data, ctx) => {
      for (const [key, rawValue] of Object.entries(data)) {
        const value = String(rawValue ?? "").trim();
        const k = key.toLowerCase();

        if (k === "campaignname" && !value) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Campaign name is required",
          });
          continue;
        }


        if (k.includes("postdescription") && !value) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Description is required",
          });
          continue;
        }


        if (
            (k.includes("content link") ||
                k.includes("track link") ||
                k.includes("link to music, events, news")) &&
            !value
        ) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "This link is required",
          });
          continue;
        }


        if (k.includes("track title") && !value) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Track title is required",
          });
          continue;
        }


        if (k.includes("link to artwork & press shots") && !value) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Artwork link is required",
          });
          continue;
        }

        // валидность ссылок
        if (value && (k.includes("link") || k.includes("url") || k.includes("drive"))) {
          if (!isValidLink(value)) {
            ctx.addIssue({
              code: "custom",
              path: [key],
              message: "Please enter a valid link",
            });
          }
        }
      }
    });