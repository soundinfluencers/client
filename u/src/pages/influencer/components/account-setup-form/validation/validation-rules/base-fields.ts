import { z } from "zod";

export const requiredAccountName = z
.string()
.trim()
.nonempty({ message: "This field is required" })
.min(2, { message: "Must contain at least 2 characters" })
.max(50, { message: "Must contain no more than 50 characters" });

export const requiredProfileLink = z.url({ message: "Please enter a valid URL" });

export const requiredFollowers = z.number({ error: "Followers is required" }).min(0, { message: "Followers must be >= 0" });

export const optionalLogoUrl = z.string().optional();

export const profileCategoryEnum = z.enum(["community", "creator"] as const);
export const profileCurrencyEnum = z.enum(["EUR", "USD", "GBP"] as const);
export const requiredPrice = z.number({ error: 'Price is required' }).min(1, { message: "Price must be >= 1" });