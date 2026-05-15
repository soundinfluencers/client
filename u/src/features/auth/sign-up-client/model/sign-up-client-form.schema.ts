import { z } from 'zod';
export const COMPANY_TYPE_OPTIONS = ['Artist', 'Promoter', 'Pr Agent', 'Label', 'Other'] as const;

export const COMPANY_TYPE = COMPANY_TYPE_OPTIONS.map(label => label) as [string, ...string[]];
;
import {parsePhoneNumberFromString} from "libphonenumber-js";


export const signUpClientFormSchema = z.object({
  firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(50, "First name must be 50 characters or less"),

  lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be 50 characters or less'),

  companyType: z
      .string()
      .min(1, 'Company type is required')
      .pipe(z.enum(COMPANY_TYPE)),

  company: z
      .string()
      .trim()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be 100 characters or less'),

  instagramUsername: z
      .string()
      .min(1, 'Username or link is required')
      .trim()
      // 1. Extract the nickname from the link or remove the @
      .transform((val) => {
        // Protection against query params and fragments in the URL, e.g. ://instagram.com/username?param=value#section
        const cleaned = val.split('?')[0].split('#')[0];
        // Regularly looks for nicknames in links like ://instagram.com or simply removes @
        const match = cleaned.match(
            /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?$|^@?([a-zA-Z0-9._]+)$/,
        );
        // Return the found group (nickname) or the original value
        return match ? (match[1] || match[2]) : val;
      })
      // 2. Convert to lowercase
      .transform((val) => val.toLowerCase())
      // 3. Validating
      .pipe(
          z.string()
              .max(30, 'Username must be 30 characters or less')
              .regex(/^[a-z0-9._]+$/, 'Invalid character in username')
              .refine((val) => !val.startsWith('.') && !val.endsWith('.'), {
                message: 'Cannot start or end with a period',
              })
              .refine((val) => !val.includes('..'), {
                message: 'Cannot contain consecutive periods',
              }),
      ),

  email: z
      .string()
      .trim()
      .min(1, { error: "Email is required" })
      .pipe(z.email("Invalid email address")),

  phone: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      const v = val.trim();

      if (!v) {
        ctx.addIssue({ code: "custom", message: 'Phone number is required' });
        return;
      }

      if (!/^\+\d+$/.test(v)) {
        ctx.addIssue({ code: "custom", message: "Invalid phone number" });
        return;
      }

      const phone = parsePhoneNumberFromString(v);

      if (!phone?.isValid()) {
        ctx.addIssue({ code: "custom", message: "Invalid phone number" });
      }
    }),

  referralCode: z.string().optional(),

  password: z
      .string()
      .min(1, "Password is required")
      .max(100, "Password must be 100 characters or less")
      .regex(/^\S+$/, 'No spaces allowed')
      .superRefine((val, ctx) => {
        // Minimum length
        if (val.length < 8) ctx.addIssue({ code: 'custom', message: 'Password must be at least 8 characters long' });
        // At least one capital letter
        if (!/[A-Z]/.test(val)) ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least one uppercase letter',
        });
        // At least one lowercase letter
        if (!/[a-z]/.test(val)) ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least one lowercase letter',
        });
        // At least one digit
        if (!/[0-9]/.test(val)) ctx.addIssue({ code: 'custom', message: 'Password must contain at least one number' });
        // At least one special character
        if (!/[^a-zA-Z0-9]/.test(val)) ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least one special character',
        });
      }),
});

export type TSignUpClientFormValues = z.infer<typeof signUpClientFormSchema>;
