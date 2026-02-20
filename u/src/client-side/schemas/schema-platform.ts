import { z } from "zod";

const httpRegex = /^https?:\/\/\S+$/i;

const isHttpField = (key: string) => {
  const k = key.toLowerCase();
  return (
    k.includes("content link") ||
    k.includes("story link") ||
    k.includes("track link") ||
    k.includes("link to music") ||
    k.includes("artwork") ||
    k.includes("links")
  );
};

const isStoryTagField = (key: string) =>
  key.toLowerCase().includes("story tag");
const isPostDescriptionField = (key: string) =>
  key.toLowerCase().includes("postdescription");

const getPostDescriptionIndex = (key: string) => {
  const m = key.match(/postdescription-(\d+)/i);
  return m ? Number(m[1]) : null;
};
export const campaignPostContentSchema: z.ZodType<Record<string, string>> = z
  .record(z.string(), z.string())
  .superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      const v = String(value ?? "").trim();
      const pdIndex = getPostDescriptionIndex(key);
      if (pdIndex && pdIndex > 1 && !v) continue;
      if (!v) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "This field is required",
        });
        continue;
      }

      if (isStoryTagField(key) && !v.startsWith("@")) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Story tag must start with '@'",
        });
        continue;
      }

      if (isHttpField(key) && !httpRegex.test(v)) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Must start with http:// or https://",
        });
      }
    }
  });
