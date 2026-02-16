import { z } from "zod";

const trimString = (v: unknown) => (typeof v === "string" ? v.trim() : v);

const requiredString = z.preprocess(
  (v) => trimString(v),
  z.string({ message: "" }).min(1, { message: "" }),
);

const optionalString = z.preprocess(
  (v) => {
    const trimmed = trimString(v);
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().optional(),
);

export const accountDetailsSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,

  email: requiredString,
  phone: requiredString,

  // telegramUsername: optionalString,
  profilePhotoUrl: optionalString,
});
