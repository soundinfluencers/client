import { z } from "zod";

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return `https://${trimmed}`;
};

const urlSchema = z
    .string()
    .trim()
    .min(1, "Link is required")
    .refine(
        (value) => {
            try {
                const url = new URL(normalizeUrl(value));

                return ["http:", "https:"].includes(url.protocol);
            } catch {
                return false;
            }
        },
        {
            message: "Enter a valid link",
        },
    );
const optionalUrlSchema = z
    .string()
    .trim()
    .refine(
        (value) => {
            if (value === "") return true;

            try {
                const url = new URL(normalizeUrl(value));

                return ["http:", "https:"].includes(url.protocol);
            } catch {
                return false;
            }
        },
        {
            message: "Enter a valid link",
        },
    );


const taggedUserSchema = z
    .string()
    .trim()
    .refine(
        (value) => {
            if (value === "") return true;

            return /^@[a-zA-Z0-9._]{1,30}$/.test(value);
        },
        {
            message: "Tagged user must start with @",
        },
    );

export const campaignPostContentDescriptionSchema = z.object({
    id: z.string(),
    value: z.string().trim().min(1, "Description is required"),
});

export const campaignPostContentFieldsSchema = z.object({
    mainLink: urlSchema,
    descriptions: z
        .array(campaignPostContentDescriptionSchema)
        .min(1, "At least one description is required"),
    taggedUser: taggedUserSchema,
    taggedLink: optionalUrlSchema,
    additionalBrief: z.string(),
});

export const campaignPostContentBlockSchema = z.object({
    id: z.string(),
    group: z.enum(["main", "music", "press"]),
    platform: z.string(),
    audience: z.enum(["creator", "community", "both"]).optional(),
    targetSocialMedias: z.array(z.string()),
    isAdditional: z.boolean(),
    isRemovable: z.boolean(),
    fields: campaignPostContentFieldsSchema,
});

export const campaignPostContentFormSchema = z.object({
    campaignName: z.string().trim().min(1, "Campaign name is required"),
    blocks: z.array(campaignPostContentBlockSchema),
});

export type CampaignPostContentFormSchema = z.infer<
    typeof campaignPostContentFormSchema
>;