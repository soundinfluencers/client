import { z } from "zod";

const TOP_COUNTRIES = 5;

const countryItemSchema = z.object({
  country: z.string().nullable(),
  percentage: z.number().nullable(),
});

export const audienceInsightsSchema = z
.array(countryItemSchema)
.length(TOP_COUNTRIES, `Audience insights must contain exactly ${TOP_COUNTRIES} slots`)
.superRefine((items, ctx) => {
  // console.log("Validating audience insights:", items);
  const arr = Array.isArray(items) ? items : [];

  const hasCountry = (c: unknown) => typeof c === "string" && c.trim().length > 0;
  const hasPercent = (p: unknown) => typeof p === "number" && Number.isFinite(p);

  const allFive = arr.every(x => hasCountry(x.country) && hasPercent(x.percentage));

  if (!allFive) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Fill in all 5 audience countries and their percentages",
    });
    return;
  }

  const sum = arr.reduce((acc, x) => acc + (x.percentage as number), 0);

  if (sum > 100) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Total audience reach percentage must not exceed 100",
    });
  }
});

// export const makeAudienceInsightsSchema = (enabled: boolean) =>
//   enabled
//     ? z
//     .array(countryItemSchema)
//     .length(TOP_COUNTRIES, `Audience insights must contain exactly ${TOP_COUNTRIES} slots`)
//     .superRefine((items, ctx) => {
//       const arr = Array.isArray(items) ? items : [];
//
//       const hasCountry = (c: unknown) =>
//         typeof c === "string" && c.trim().length > 0;
//       const hasPercent = (p: unknown) =>
//         typeof p === "number" && Number.isFinite(p);
//
//       const allFive = arr.every(
//         x => hasCountry(x.country) && hasPercent(x.percentage),
//       );
//
//       if (!allFive) {
//         ctx.addIssue({
//           code: "custom",
//           path: [],
//           message: "Fill in all 5 audience countries and their percentages",
//         });
//         return;
//       }
//
//       const sum = arr.reduce(
//         (acc, x) => acc + (x.percentage as number),
//         0,
//       );
//
//       if (sum > 100) {
//         ctx.addIssue({
//           code: "custom",
//           path: [],
//           message: "Total audience reach percentage must not exceed 100",
//         });
//       }
//     })
//     : z.any();