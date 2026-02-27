import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(2, "Must be at least 2 characters").max(50),
  lastName: z.string().trim().min(2, "Must be at least 2 characters").max(50),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().superRefine((val, ctx) => {
    const v = val.trim();

    if (!v) {
      ctx.addIssue({ code: "custom", message: "This field is required" });
      return;
    }

    if (!/^\+\d+$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "Invalid phone number" });
      return;
    }

    let p;
    try {
      p = parsePhoneNumber(v);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid phone number" });
      return;
    }

    if ((p.nationalNumber?.length ?? 0) < 5) return;

    if (!p.isValid()) {
      ctx.addIssue({ code: "custom", message: "Invalid phone number" });
    }
  }),
  password: z.string().min(8, "Must be at least 8 characters"),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;