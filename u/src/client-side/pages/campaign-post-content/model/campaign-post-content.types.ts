import type {SocialMedia} from "@/client-side/types/common.ts";


export type GroupKey = "main" | "music" | "press";
export type EntityType = 0 | 1;

export type GroupedPlatforms = Record<GroupKey, SocialMedia[]>;

export type AdditionalForm = {
    id: string;
    group: GroupKey;
    socialMedia: SocialMedia;
};

export type PlatformFormConfigField = {
    id: string;
    name: string;
    placeholder: string;
    required?: boolean;
};

export type PlatformFormConfigTextArea = {
    id: string;
    name: string;
    placeholder: string;
};

export type PlatformFormConfig = {
    inputs: PlatformFormConfigField[];
    textAreas?: PlatformFormConfigTextArea[];
    contentTitle: string;
};