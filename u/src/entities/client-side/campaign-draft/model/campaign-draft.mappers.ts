import type {
    CampaignDraftAccountGetDto,
    CampaignDraftGetDto,
} from "../api/campaign-draft.dto.ts";
import {
    CampaignDraftLatestStep,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";
import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import { ObjectId } from "bson";
import { normalizeAdditionalBriefVersions } from "@/entities/client-side/campaign/model/campaign-content";

const isProfileType = (
    value: string | undefined,
): value is "creator" | "community" =>
    value === "creator" || value === "community";

const unique = (values: readonly string[]): string[] =>
    [...new Set(values)];

const mapDraftAccountGenres = (
    account: CampaignDraftAccountGetDto,
): string[] | undefined => {
    if (account.profileType === "community") {
        if (
            account.communityMusicGenres === undefined &&
            account.communityThemeTopics === undefined
        ) {
            return undefined;
        }

        return unique([
            ...(account.communityMusicGenres ?? []),
            ...(account.communityThemeTopics ?? []),
        ]);
    }

    if (account.profileType === "creator") {
        if (
            account.creatorMusicGenres === undefined &&
            account.creatorContentFocus === undefined
        ) {
            return undefined;
        }

        return unique([
            ...(account.creatorMusicGenres ?? []),
            ...(account.creatorContentFocus ?? []),
        ]);
    }

    return undefined;
};

export const mapDraftStepToBuilderStep = (
    step: CampaignDraftGetDto["step"],
): CampaignDraftLatestStep => CampaignDraftLatestStep[step];

export const mapDraftAccountToSelectedAccount = (
    account: CampaignDraftAccountGetDto,
    currency: CampaignCurrencyCode,
): SelectedCampaignAccount => ({
    accountId: account.socialAccountId,
    influencerId: account.influencerId,
    socialMedia: account.socialMedia,
    username: account.username,
    logoUrl: account.logoUrl || undefined,
    followers: account.followers,
    ...(account.source === "standalone"
        ? { price: account.prices[currency] }
        : {}),
    prices: { ...account.prices },
    dateRequest: account.dateRequest || "ASAP",
    selectedCampaignContentItem: account.selectedCampaignContentItem
        ? { ...account.selectedCampaignContentItem }
        : undefined,
    profileType: isProfileType(account.profileType)
        ? account.profileType
        : undefined,
    genres: mapDraftAccountGenres(account),
    countries: account.countries?.map((country) => ({
        ...country,
    })),
    source:
        account.source === "standalone" ? "manual" : account.source,
    ...(account.source === "bundle" && account.bundleId
        ? { bundleId: account.bundleId }
        : {}),
});

export const mapDraftContentToCampaignContent = (
    items: CampaignDraftGetDto["campaignContent"],
): CampaignContentItem[] =>
    items.map((item) => ({
        ...item,
        additionalBrief: normalizeAdditionalBriefVersions(
            item.additionalBrief,
            { createId: () => new ObjectId().toHexString() },
        ),
        descriptions: item.descriptions.map((description) => ({
            ...description,
        })),
    }));
