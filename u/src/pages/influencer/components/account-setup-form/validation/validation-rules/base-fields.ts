import { z } from "zod";

export const requiredAccountName = z
.string()
.trim()
.nonempty({ message: "Account name is required" })
.min(2, { message: "Must contain at least 2 characters" })
.max(50, { message: "Must contain no more than 50 characters" });

export const requiredProfileLink = z
.string({ message: "Please enter a valid account link" })
.trim()
.min(1, { message: "This field is required" })
.transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
.pipe(z.url({ message: "Please enter a valid account link" }))
.superRefine((val, ctx) => {
  try {
    const u = new URL(val);
    const host = u.hostname.toLowerCase();

    if (!host.includes(".")) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid account link" });
      return;
    }

    const tld = host.split(".").pop() ?? "";
    if (tld.length < 2) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid account link" });
    }

    // if (host === "localhost") { // allow localhost for testing }

  } catch {
    ctx.addIssue({ code: "custom", message: "Please enter a valid account link" });
  }
});

export const requiredFollowers = z.number({ error: "Followers is required" }).min(0, { message: "Followers must be >= 0" });

export const requiredLogoUrl = z
.union([z.string(), z.null()])
.transform((v) => (typeof v === "string" ? v.trim() : v))
.refine((v) => typeof v === "string" && v.length > 0, {
  message: "Logo is required",
});

export const profileCategoryEnum = z.enum(["community", "creator"] as const);
export const profileCurrencyEnum = z.enum(["EUR", "USD", "GBP"] as const);
export const requiredPrice = z.number({ error: 'Price is required' }).min(1, { message: "Price must be >= 1" });