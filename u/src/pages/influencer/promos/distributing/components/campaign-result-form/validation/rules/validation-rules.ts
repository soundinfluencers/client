import { z } from "zod";

// Regular expression to validate date in dd/mm/yyyy format
const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

// Preprocess to trim strings and handle null/undefined as empty string
const asTrimmedString = (v: unknown) => {
  if (v == null) return "";
  if (typeof v !== "string") return "";
  return v.trim();
};

const makeRequiredUrl = (requiredMsg: string, invalidMsg: string) =>
  z.preprocess(
    asTrimmedString,
    z
    .string()
    .min(1, { error: requiredMsg })
    .transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
    .pipe(z.url({ error: invalidMsg }))
    .superRefine((val, ctx) => {

      try {
        const u = new URL(val);
        const host = u.hostname.toLowerCase();

        if (!host.includes(".")) {
          ctx.addIssue({ code: "custom", message: invalidMsg });
          return;
        }

        const tld = host.split(".").pop() ?? "";
        if (tld.length < 2) {
          ctx.addIssue({ code: "custom", message: invalidMsg });
        }
      } catch {
        ctx.addIssue({ code: "custom", message: invalidMsg });
      }
    })
  );

const makeRequiredDate = (requiredMsg: string, invalidMsg: string) =>
  z.preprocess(
    asTrimmedString,
    z.string().min(1, { error: requiredMsg }).regex(dateRegex, {
      error: invalidMsg,
    })
  );

const makeNumberField = (requiredMsg: string, min = 0) =>
  z.preprocess(
    (v) => (v == null ? NaN : v),
    z
    .number({ message: requiredMsg })
    .refine((n) => Number.isFinite(n), {
      message: requiredMsg,
    })
    .refine((n) => n >= 0, {
      message: `Must be ${min} or more`,
    })
  );

// Validation messages for campaign result form fields
export const postLinkField = makeRequiredUrl(
  "Post link is required",
  "Please enter a valid post link"
);

export const datePostField = makeRequiredDate(
  "Date post is required",
  "Please enter a valid date in dd/mm/yyyy format"
);

export const screenshotUrlField = makeRequiredUrl(
  "Screenshot is required",
  "Please enter a valid screenshot"
);

// For numeric fields, we can use the same function with different messages
export const impressionsField = makeNumberField("Impressions is required", 0);
export const likeField = makeNumberField("Likes is required", 0);
export const commentsField = makeNumberField("Comments is required", 0);
export const sharesField = makeNumberField("Shares is required", 0);
export const ratingField = makeNumberField("Rating is required", 1);


