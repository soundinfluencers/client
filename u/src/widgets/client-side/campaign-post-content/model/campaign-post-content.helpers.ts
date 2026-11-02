import { ObjectId } from "bson";
import { serializeCampaignContent, serializeContentReference } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import {
    MAIN_PLATFORMS,
    MUSIC_PLATFORMS,
    PRESS_PLATFORMS,
} from "./campaign-post-content.constants";
import type {
    AdditionalMainTarget,
    BuiltAddedAccount,
    BuiltCampaignContentWithMeta,
    BuiltCampaignPostContentPayload,
    CampaignBlockAudience,
    CampaignContentAudience,
    CampaignContentGroup,
    CampaignPostContentAccount,
    CampaignPostContentBlock,
    CampaignPostContentDescription,
    CampaignPostContentFields,
} from "./campaign-post-content.types";

const oid = () => new ObjectId().toHexString();
const briefText = (brief: BuiltCampaignContentWithMeta["additionalBrief"] | string) =>
    Array.isArray(brief) ? brief[0]?.additionalBrief ?? "" : brief ?? "";

export const normalizeSocial = (value: string) =>
    String(value || "").toLowerCase();

export const isMainPlatform = (platform: string) =>
    MAIN_PLATFORMS.includes(normalizeSocial(platform) as never);

export const isMusicPlatform = (platform: string) =>
    MUSIC_PLATFORMS.includes(normalizeSocial(platform) as never);

export const isPressPlatform = (platform: string) =>
    PRESS_PLATFORMS.includes(normalizeSocial(platform) as never);

export const resolveGroupByPlatform = (
    platform: string,
): CampaignContentGroup => {
    if (isMainPlatform(platform)) return "main";
    if (isMusicPlatform(platform)) return "music";
    return "press";
};

export const createEmptyDescription = (): CampaignPostContentDescription => ({
    id: oid(),
    value: "",
});

export const createEmptyFields = (): CampaignPostContentFields => ({
    mainLink: "",
    descriptions: [createEmptyDescription()],
    taggedUser: "",
    taggedLink: "",
    additionalBrief: "",
});

export const createBlock = ({
                                group,
                                platform,
                                audience,
                                targetSocialMedias,
                                isAdditional,
                                isRemovable,
                            }: {
    group: CampaignContentGroup;
    platform: string;
    audience?: CampaignBlockAudience;
    targetSocialMedias: string[];
    isAdditional: boolean;
    isRemovable: boolean;
}): CampaignPostContentBlock => ({
    id: oid(),
    group,
    platform: normalizeSocial(platform),
    audience,
    targetSocialMedias: targetSocialMedias.map(normalizeSocial),
    isAdditional,
    isRemovable,
    fields: createEmptyFields(),
});

export const getUniquePlatforms = (
    accounts: CampaignPostContentAccount[],
): string[] => {
    return Array.from(
        new Set(
            accounts
                .map((item) => normalizeSocial(item.socialMedia))
                .filter(Boolean),
        ),
    );
};

export const getAccountsByGroup = (
    accounts: CampaignPostContentAccount[],
    group: CampaignContentGroup,
) => {
    return accounts.filter((account) => {
        const platform = normalizeSocial(account.socialMedia);

        if (group === "main") return isMainPlatform(platform);
        if (group === "music") return isMusicPlatform(platform);
        return isPressPlatform(platform);
    });
};

export const getMainAudienceSet = (
    accounts: CampaignPostContentAccount[],
): Set<CampaignContentAudience> => {
    const set = new Set<CampaignContentAudience>();

    getAccountsByGroup(accounts, "main").forEach((account) => {
        if (account.profileType === "creator") set.add("creator");
        if (account.profileType === "community") set.add("community");
    });

    return set;
};

export const buildInitialBlocks = (
    accounts: CampaignPostContentAccount[],
): CampaignPostContentBlock[] => {
    const blocks: CampaignPostContentBlock[] = [];

    const mainAccounts = getAccountsByGroup(accounts, "main");
    const mainAudiences = getMainAudienceSet(accounts);

    const hasCreator = mainAudiences.has("creator");
    const hasCommunity = mainAudiences.has("community");

    const mainPlatforms = Array.from(
        new Set(mainAccounts.map((item) => normalizeSocial(item.socialMedia))),
    );

    if (hasCreator || hasCommunity) {
        blocks.push(
            createBlock({
                group: "main",
                platform: "main",
                audience:
                    hasCreator && hasCommunity
                        ? "both"
                        : hasCreator
                            ? "creator"
                            : "community",
                targetSocialMedias: mainPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    const musicAccounts = getAccountsByGroup(accounts, "music");
    const musicPlatforms = Array.from(
        new Set(musicAccounts.map((item) => normalizeSocial(item.socialMedia))),
    );

    if (musicAccounts.length > 0) {
        blocks.push(
            createBlock({
                group: "music",
                platform: "music",
                targetSocialMedias: musicPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    const pressAccounts = getAccountsByGroup(accounts, "press");
    const pressPlatforms = Array.from(
        new Set(pressAccounts.map((item) => normalizeSocial(item.socialMedia))),
    );

    if (pressAccounts.length > 0) {
        blocks.push(
            createBlock({
                group: "press",
                platform: "press",
                targetSocialMedias: pressPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    return blocks;
};

export const getMainUiLabel = (
    accounts: CampaignPostContentAccount[],
): string => {
    const audiences = getMainAudienceSet(accounts);

    if (audiences.has("creator") && audiences.has("community")) {
        return "For creators and communities";
    }

    if (audiences.has("creator")) return "For creators";
    if (audiences.has("community")) return "For communities";

    return "Main";
};

export const canAddAdditionalToMain = (
    accounts: CampaignPostContentAccount[],
): {
    directAudience?: CampaignContentAudience;
    mustChoose: boolean;
} => {
    const audiences = getMainAudienceSet(accounts);

    if (audiences.size === 1) {
        return {
            directAudience: audiences.has("creator") ? "creator" : "community",
            mustChoose: false,
        };
    }

    return { mustChoose: true };
};

export const canAddAdditionalToMusic = (
    accounts: CampaignPostContentAccount[],
): {
    directPlatform?: string;
    mustChoose: boolean;
    platforms: string[];
} => {
    const platforms = Array.from(
        new Set(
            getAccountsByGroup(accounts, "music").map((item) =>
                normalizeSocial(item.socialMedia),
            ),
        ),
    );

    if (platforms.length <= 1) {
        return {
            directPlatform: platforms[0],
            mustChoose: false,
            platforms,
        };
    }

    return {
        mustChoose: true,
        platforms,
    };
};

export const addAdditionalMainBlock = (
    blocks: CampaignPostContentBlock[],
    audience: AdditionalMainTarget,
): CampaignPostContentBlock[] => {
    const baseMainBlock = blocks.find(
        (item) => item.group === "main" && !item.isAdditional,
    );

    return [
        ...blocks,
        createBlock({
            group: "main",
            platform: "main",
            audience,
            targetSocialMedias: baseMainBlock?.targetSocialMedias ?? [],
            isAdditional: true,
            isRemovable: true,
        }),
    ];
};

export const addAdditionalMusicBlock = (
    blocks: CampaignPostContentBlock[],
    platform: string,
): CampaignPostContentBlock[] => {
    return [
        ...blocks,
        createBlock({
            group: "music",
            platform,
            targetSocialMedias: [normalizeSocial(platform)],
            isAdditional: true,
            isRemovable: true,
        }),
    ];
};

export const removeBlock = (
    blocks: CampaignPostContentBlock[],
    blockId: string,
): CampaignPostContentBlock[] => {
    return blocks.filter((item) => item.id !== blockId);
};

export const updateBlockFields = (
    blocks: CampaignPostContentBlock[],
    blockId: string,
    fields: CampaignPostContentFields,
): CampaignPostContentBlock[] => {
    return blocks.map((item) =>
        item.id === blockId ? { ...item, fields } : item,
    );
};

export const addDescriptionToBlock = (
    blocks: CampaignPostContentBlock[],
    blockId: string,
): CampaignPostContentBlock[] => {
    return blocks.map((item) =>
        item.id === blockId
            ? {
                ...item,
                fields: {
                    ...item.fields,
                    descriptions: [
                        ...item.fields.descriptions,
                        createEmptyDescription(),
                    ],
                },
            }
            : item,
    );
};

export const removeDescriptionFromBlock = (
    blocks: CampaignPostContentBlock[],
    blockId: string,
    descriptionId: string,
): CampaignPostContentBlock[] => {
    return blocks.map((item) => {
        if (item.id !== blockId) return item;
        if (item.fields.descriptions.length <= 1) return item;

        return {
            ...item,
            fields: {
                ...item.fields,
                descriptions: item.fields.descriptions.filter(
                    (desc) => desc.id !== descriptionId,
                ),
            },
        };
    });
};

export const updateDescriptionInBlock = (
    blocks: CampaignPostContentBlock[],
    blockId: string,
    descriptionId: string,
    value: string,
): CampaignPostContentBlock[] => {
    return blocks.map((item) => {
        if (item.id !== blockId) return item;

        return {
            ...item,
            fields: {
                ...item.fields,
                descriptions: item.fields.descriptions.map((desc) =>
                    desc.id === descriptionId ? { ...desc, value } : desc,
                ),
            },
        };
    });
};

export const getAccountsForBlock = (
    block: CampaignPostContentBlock,
    accounts: CampaignPostContentAccount[],
) => {
    if (block.group === "main") {
        const mainAccounts = accounts.filter((account) =>
            isMainPlatform(normalizeSocial(account.socialMedia)),
        );

        if (!block.isAdditional) {
            if (block.audience === "creator") {
                return mainAccounts.filter(
                    (account) => account.profileType === "creator",
                );
            }

            if (block.audience === "community") {
                return mainAccounts.filter(
                    (account) => account.profileType === "community",
                );
            }

            return mainAccounts;
        }

        if (block.audience && block.audience !== "both") {
            return mainAccounts.filter(
                (account) => account.profileType === block.audience,
            );
        }

        return mainAccounts;
    }

    if (block.group === "music") {
        const musicAccounts = accounts.filter((account) =>
            isMusicPlatform(normalizeSocial(account.socialMedia)),
        );

        if (!block.isAdditional) {
            return musicAccounts;
        }

        return musicAccounts.filter(
            (account) =>
                normalizeSocial(account.socialMedia) ===
                normalizeSocial(block.platform),
        );
    }

    return accounts.filter((account) =>
        isPressPlatform(normalizeSocial(account.socialMedia)),
    );
};

export const buildCampaignContentFromBlocks = (
    blocks: CampaignPostContentBlock[],
    accounts: CampaignPostContentAccount[],
): BuiltCampaignContentWithMeta[] => {
    const built = blocks.flatMap<BuiltCampaignContentWithMeta>((block) => {
        const blockAccounts = getAccountsForBlock(block, accounts);

        if (block.group === "main") {
            const realTargets = Array.from(
                new Map(
                    blockAccounts
                        .filter(
                            (account) =>
                                account.profileType === "creator" ||
                                account.profileType === "community",
                        )
                        .map((account) => {
                            const socialMedia = normalizeSocial(account.socialMedia);
                            const profileType =
                                account.profileType as CampaignContentAudience;

                            return [
                                `${socialMedia}:${profileType}`,
                                { socialMedia, profileType },
                            ] as const;
                        }),
                ).values(),
            );

            return realTargets.map((target): BuiltCampaignContentWithMeta => ({
                _id: oid(),
                socialMedia: target.socialMedia,
                socialMediaGroup: "main",
                profileType: target.profileType,
                mainLink: block.fields.mainLink.trim(),
                descriptions: block.fields.descriptions.map((item) => ({
                    _id: oid(),
                    description: item.value.trim(),
                })),
                taggedUser: block.fields.taggedUser.trim(),
                taggedLink: block.fields.taggedLink.trim(),
                additionalBrief: [],
                meta: {
                    blockId: block.id,
                    platform: block.platform,
                    group: block.group,
                    targetSocialMedia: target.socialMedia,
                    targetProfileType: target.profileType,
                },
            }));
        }

        if (block.group === "music") {
            const realTargets = Array.from(
                new Set(
                    blockAccounts.map((account) =>
                        normalizeSocial(account.socialMedia),
                    ),
                ),
            );

            return realTargets.map(
                (socialMedia): BuiltCampaignContentWithMeta => ({
                    _id: oid(),
                    socialMedia,
                    socialMediaGroup: "music",
                    profileType: "community",
                    mainLink: block.fields.mainLink.trim(),
                    descriptions: block.fields.descriptions.map((item) => ({
                        _id: oid(),
                        description: item.value.trim(),
                    })),
                    taggedUser: "",
                    taggedLink: "",
                    additionalBrief: [],
                    meta: {
                        blockId: block.id,
                        platform: block.platform,
                        group: block.group,
                        targetSocialMedia: socialMedia,
                        targetProfileType: "community",
                    },
                }),
            );
        }

        const realTargets = Array.from(
            new Set(
                blockAccounts.map((account) =>
                    normalizeSocial(account.socialMedia),
                ),
            ),
        );

        return realTargets.map(
            (socialMedia): BuiltCampaignContentWithMeta => ({
                _id: oid(),
                socialMedia,
                socialMediaGroup: "press",
                profileType: "community",
                mainLink: block.fields.mainLink.trim(),
                descriptions: block.fields.descriptions.map((item) => ({
                    _id: oid(),
                    description: item.value.trim(),
                })),
                taggedUser: "",
                taggedLink: block.fields.taggedLink.trim(),
                additionalBrief: [],
                meta: {
                    blockId: block.id,
                    platform: block.platform,
                    group: block.group,
                    targetSocialMedia: socialMedia,
                    targetProfileType: "community",
                },
            }),
        );
    });
    return built.map((item) => {
        const block = blocks.find((b) => b.id === item.meta.blockId);
        const saved = block?.savedContent?.find((c) => c.socialMedia === item.socialMedia && c.profileType === item.profileType);
        const descriptions = item.descriptions.map((d, index) => {
            const fieldId = block?.fields.descriptions[index]?.id;
            const originalIndex = block?.savedContent?.[0]?.descriptions.findIndex((desc) => desc._id === fieldId) ?? -1;
            return { ...d, _id: originalIndex >= 0 ? saved?.descriptions[originalIndex]?._id ?? fieldId ?? d._id : fieldId ?? d._id };
        });
        const briefs = Array.isArray(saved?.additionalBrief) ? saved.additionalBrief : [];
        const editedBrief = block?.fields.additionalBrief.trim() ?? "";
        const firstBriefs = block?.savedContent?.[0]?.additionalBrief;
        const editedIndex = block?.briefFieldId === null ? -1 : block?.briefFieldId && Array.isArray(firstBriefs)
            ? firstBriefs.findIndex((brief) => brief._id === block.briefFieldId) : 0;
        const additionalBrief = briefs.flatMap((brief, index) => index === editedIndex
            ? editedBrief ? [{ ...brief, additionalBrief: editedBrief }] : [] : [brief]);
        if (editedBrief && !briefs[editedIndex]) additionalBrief.unshift({ _id: oid(), additionalBrief: editedBrief });
        return { ...serializeCampaignContent([{ ...item, _id: saved?._id ?? item._id, descriptions, additionalBrief }])[0], meta: item.meta };
    });
};

const pickContentItemForAccount = ({
                                       account,
                                       contentItems,
                                   }: {
    account: CampaignPostContentAccount;
    contentItems: BuiltCampaignContentWithMeta[];
}) => {
    const social = normalizeSocial(account.socialMedia);
    const group = resolveGroupByPlatform(social);

    if (group === "main") {
        return (
            contentItems.find(
                (item) =>
                    item.socialMediaGroup === "main" &&
                    normalizeSocial(item.socialMedia) === social &&
                    item.profileType === account.profileType,
            ) ?? null
        );
    }

    if (group === "music") {
        return (
            contentItems.find(
                (item) =>
                    item.socialMediaGroup === "music" &&
                    normalizeSocial(item.socialMedia) === social,
            ) ?? null
        );
    }

    return (
        contentItems.find(
            (item) =>
                item.socialMediaGroup === "press" &&
                normalizeSocial(item.socialMedia) === social,
        ) ?? null
    );
};

export const buildAddedAccountsFromBlocks = ({
                                                 accounts,
                                                 contentItems,
                                             }: {
    accounts: CampaignPostContentAccount[];
    contentItems: BuiltCampaignContentWithMeta[];
}): BuiltAddedAccount[] => {
    return accounts
        .map((account) => {
            const savedRef = account.selectedCampaignContentItem;
            const savedItem = savedRef && contentItems.find((c) => c._id === savedRef.campaignContentItemId);
            const contentItem = savedItem || pickContentItemForAccount({
                account,
                contentItems,
            });

            if (!contentItem) return null;

            return {
                ...(account.selectionId ? { selectionId: account.selectionId } : {}),
                socialAccountId: String(account.accountId),
                influencerId: String(account.influencerId),
                socialMedia: normalizeSocial(account.socialMedia),
                username: String(account.username),
                selectedCampaignContentItem: serializeContentReference(savedItem && savedRef ? savedRef : {
                    campaignContentItemId: contentItem._id,
                    descriptionId: contentItem.descriptions[0]?._id ?? null,
                    additionalBriefId: Array.isArray(contentItem.additionalBrief) ? contentItem.additionalBrief[0]?._id ?? null : null,
                }, contentItems)!,
                profileType: account.profileType,
                dateRequest: account.dateRequest ?? "ASAP",
            };
        })
        .filter(Boolean) as BuiltAddedAccount[];
};

export const buildCampaignPostContentPayload = ({
                                                    campaignName,
                                                    campaignPrice,
                                                    accounts,
                                                    blocks,
                                                    onBuiltBlocks,
                                                }: {
    campaignName: string;
    campaignPrice: number;
    accounts: CampaignPostContentAccount[];
    blocks: CampaignPostContentBlock[];
    onBuiltBlocks?: (blocks: CampaignPostContentBlock[]) => void;
}): BuiltCampaignPostContentPayload => {
    const builtContent = buildCampaignContentFromBlocks(blocks, accounts);
    // Pin generated transport IDs to the existing form-block snapshot before another save/transition.
    onBuiltBlocks?.(blocks.map((block) => {
        const savedContent = builtContent.filter((item) => item.meta.blockId === block.id).map(({ meta, ...item }) => item);
        const firstBriefs = savedContent[0]?.additionalBrief;
        const previousBriefs = block.savedContent?.[0]?.additionalBrief;
        const previousBriefIndex = block.briefFieldId && Array.isArray(previousBriefs)
            ? previousBriefs.findIndex((brief) => brief._id === block.briefFieldId) : 0;
        return { ...block, savedContent, briefFieldId: block.fields.additionalBrief.trim()
            ? (Array.isArray(firstBriefs) ? firstBriefs[Math.max(previousBriefIndex, 0)]?._id : undefined) : null };
    }));

    const addedAccounts = buildAddedAccountsFromBlocks({
        accounts,
        contentItems: builtContent,
    });

    const socials = Array.from(
        new Set(addedAccounts.map((item) => item.socialMedia).filter(Boolean)),
    );

    const socialMedia =
        socials.length > 1 ? "multipromo" : socials[0] ?? "instagram";

    return {
        campaignName: campaignName.trim(),
        socialMedia,
        campaignPrice,
        addedAccounts,
        campaignContent: builtContent.map(({ meta, ...item }) => item),
    };
};

const MAIN_SOCIALS = ["instagram", "tiktok", "youtube", "facebook"];
const MUSIC_SOCIALS = ["spotify", "soundcloud"];

const getGroup = (socialMedia?: string): "main" | "music" | "press" => {
    const social = normalizeSocial(socialMedia || "");

    if (MAIN_SOCIALS.includes(social)) return "main";
    if (MUSIC_SOCIALS.includes(social)) return "music";
    return "press";
};

const uniq = <T,>(items: T[]) => Array.from(new Set(items));

export const syncBlocksWithAccounts = ({
                                           accounts,
                                           blocks,
                                       }: {
    accounts: CampaignPostContentAccount[];
    blocks: CampaignPostContentBlock[];
}): CampaignPostContentBlock[] => {
    const current = [...blocks];

    const mainAccounts = accounts.filter(
        (item) => getGroup(item.socialMedia) === "main",
    );
    const musicAccounts = accounts.filter(
        (item) => getGroup(item.socialMedia) === "music",
    );
    const pressAccounts = accounts.filter(
        (item) => getGroup(item.socialMedia) === "press",
    );

    const hasMain = mainAccounts.length > 0;
    const hasMusic = musicAccounts.length > 0;
    const hasPress = pressAccounts.length > 0;

    const hasCreator = mainAccounts.some(
        (item) => item.profileType === "creator",
    );
    const hasCommunity = mainAccounts.some(
        (item) => item.profileType === "community",
    );

    const mainAudience: CampaignBlockAudience | undefined =
        hasCreator && hasCommunity
            ? "both"
            : hasCreator
                ? "creator"
                : hasCommunity
                    ? "community"
                    : undefined;

    const mainPlatforms = uniq(
        mainAccounts.map((item) => normalizeSocial(item.socialMedia)),
    );
    const musicPlatforms = uniq(
        musicAccounts.map((item) => normalizeSocial(item.socialMedia)),
    );
    const pressPlatforms = uniq(
        pressAccounts.map((item) => normalizeSocial(item.socialMedia)),
    );

    const next = current.filter((block) => {
        if (block.group === "main") return hasMain;
        if (block.group === "music") return hasMusic;
        if (block.group === "press") return hasPress;
        return true;
    });

    const ensureBaseBlock = (
        group: "main" | "music" | "press",
        factory: () => CampaignPostContentBlock,
    ) => {
        const exists = next.some(
            (block) => block.group === group && !block.isAdditional,
        );
        if (!exists) next.push(factory());
    };

    if (hasMain) {
        ensureBaseBlock("main", () =>
            createBlock({
                group: "main",
                platform: "main",
                audience: mainAudience,
                targetSocialMedias: mainPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    if (hasMusic) {
        ensureBaseBlock("music", () =>
            createBlock({
                group: "music",
                platform: "music",
                targetSocialMedias: musicPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    if (hasPress) {
        ensureBaseBlock("press", () =>
            createBlock({
                group: "press",
                platform: "press",
                targetSocialMedias: pressPlatforms,
                isAdditional: false,
                isRemovable: false,
            }),
        );
    }

    return next.map((block) => {
        if (block.group === "main" && !block.isAdditional) {
            // Distinct saved Creator/Community briefs must not become two shared blocks.
            const separateMainBriefs = next.filter((item) => item.group === "main" && !item.isAdditional).length > 1;
            return {
                ...block,
                audience: separateMainBriefs ? block.audience : mainAudience,
                targetSocialMedias: mainPlatforms,
            };
        }

        if (block.group === "music" && !block.isAdditional) {
            return {
                ...block,
                targetSocialMedias: musicPlatforms,
            };
        }

        if (block.group === "press" && !block.isAdditional) {
            return {
                ...block,
                targetSocialMedias: pressPlatforms,
            };
        }

        return block;
    });
};
export const buildBlocksFromCampaignContent = ({
                                                   accounts,
                                                   campaignContent,
                                               }: {
    accounts: CampaignPostContentAccount[];
    campaignContent: Array<{
        _id: string;
        socialMedia: string;
        socialMediaGroup: string;
        mainLink: string;
        descriptions: { _id: string; description: string }[];
        taggedUser: string;
        taggedLink: string;
        additionalBrief: string | Array<{ _id: string; additionalBrief: string }>;
        profileType?: "creator" | "community";
    }>;
}): CampaignPostContentBlock[] => {
    const blocks: CampaignPostContentBlock[] = [];

    const mainItems = campaignContent.filter(
        (item) => item.socialMediaGroup === "main",
    );
    const musicItems = campaignContent.filter(
        (item) => item.socialMediaGroup === "music",
    );
    const pressItems = campaignContent.filter(
        (item) => item.socialMediaGroup === "press",
    );

    const normalizeDescriptions = (
        descriptions: { _id: string; description: string }[],
    ): CampaignPostContentDescription[] =>
        descriptions?.length
            ? descriptions.map((item) => ({
                id: String(item._id),
                value: String(item.description ?? ""),
            }))
            : [createEmptyDescription()];

    const isSameMainPayload = (
        a?: typeof mainItems[number],
        b?: typeof mainItems[number],
    ) => {
        if (!a || !b) return false;

        const aDescriptions = JSON.stringify(
            (a.descriptions ?? []).map((d) => String(d.description ?? "").trim()),
        );
        const bDescriptions = JSON.stringify(
            (b.descriptions ?? []).map((d) => String(d.description ?? "").trim()),
        );
        const briefValues = (brief: typeof a.additionalBrief) => JSON.stringify(
            typeof brief === "string" ? (brief.trim() ? [brief.trim()] : [])
                : brief.map((item) => item.additionalBrief.trim()),
        );

        return (
            String(a.mainLink ?? "").trim() === String(b.mainLink ?? "").trim() &&
            aDescriptions === bDescriptions &&
            String(a.taggedUser ?? "").trim() === String(b.taggedUser ?? "").trim() &&
            String(a.taggedLink ?? "").trim() === String(b.taggedLink ?? "").trim() &&
            briefValues(a.additionalBrief) === briefValues(b.additionalBrief)
        );
    };

    const creatorMain = mainItems.filter((item) => item.profileType === "creator");
    const communityMain = mainItems.filter((item) => item.profileType === "community");

    const usedMainIds = new Set<string>();

    creatorMain.forEach((creatorItem) => {
        if (usedMainIds.has(String(creatorItem._id))) return;

        const matchingCommunity = communityMain.find(
            (communityItem) =>
                !usedMainIds.has(String(communityItem._id)) &&
                isSameMainPayload(creatorItem, communityItem),
        );

        if (matchingCommunity) {
            usedMainIds.add(String(creatorItem._id));
            usedMainIds.add(String(matchingCommunity._id));

            blocks.push({
                savedContent: [creatorItem, matchingCommunity] as BuiltCampaignContentWithMeta[],
                id: oid(),
                group: "main",
                platform: "main",
                audience: "both",
                targetSocialMedias: Array.from(
                    new Set([
                        normalizeSocial(creatorItem.socialMedia),
                        normalizeSocial(matchingCommunity.socialMedia),
                    ]),
                ),
                isAdditional: false,
                isRemovable: false,
                fields: {
                    mainLink: String(creatorItem.mainLink ?? ""),
                    descriptions: normalizeDescriptions(creatorItem.descriptions ?? []),
                    taggedUser: String(creatorItem.taggedUser ?? ""),
                    taggedLink: String(creatorItem.taggedLink ?? ""),
                    additionalBrief: briefText(creatorItem.additionalBrief),
                },
            });

            return;
        }

        usedMainIds.add(String(creatorItem._id));

        blocks.push({
            savedContent: [creatorItem] as BuiltCampaignContentWithMeta[],
            id: oid(),
            group: "main",
            platform: "main",
            audience: "creator",
            targetSocialMedias: [normalizeSocial(creatorItem.socialMedia)],
            isAdditional: false,
            isRemovable: false,
            fields: {
                mainLink: String(creatorItem.mainLink ?? ""),
                descriptions: normalizeDescriptions(creatorItem.descriptions ?? []),
                taggedUser: String(creatorItem.taggedUser ?? ""),
                taggedLink: String(creatorItem.taggedLink ?? ""),
                additionalBrief: briefText(creatorItem.additionalBrief),
            },
        });
    });

    communityMain.forEach((communityItem) => {
        if (usedMainIds.has(String(communityItem._id))) return;

        usedMainIds.add(String(communityItem._id));

        blocks.push({
            savedContent: [communityItem] as BuiltCampaignContentWithMeta[],
            id: oid(),
            group: "main",
            platform: "main",
            audience: "community",
            targetSocialMedias: [normalizeSocial(communityItem.socialMedia)],
            isAdditional: false,
            isRemovable: false,
            fields: {
                mainLink: String(communityItem.mainLink ?? ""),
                descriptions: normalizeDescriptions(communityItem.descriptions ?? []),
                taggedUser: String(communityItem.taggedUser ?? ""),
                taggedLink: String(communityItem.taggedLink ?? ""),
                additionalBrief: briefText(communityItem.additionalBrief),
            },
        });
    });

    musicItems.forEach((item, index) => {
        blocks.push({
            savedContent: [item] as BuiltCampaignContentWithMeta[],
            id: oid(),
            group: "music",
            platform: normalizeSocial(item.socialMedia),
            targetSocialMedias: [normalizeSocial(item.socialMedia)],
            isAdditional: index > 0,
            isRemovable: index > 0,
            fields: {
                mainLink: String(item.mainLink ?? ""),
                descriptions: normalizeDescriptions(item.descriptions ?? []),
                taggedUser: "",
                taggedLink: "",
                additionalBrief: briefText(item.additionalBrief),
            },
        });
    });

    pressItems.forEach((item, index) => {
        blocks.push({
            savedContent: [item] as BuiltCampaignContentWithMeta[],
            id: oid(),
            group: "press",
            platform: "press",
            targetSocialMedias: [normalizeSocial(item.socialMedia)],
            isAdditional: index > 0,
            isRemovable: index > 0,
            fields: {
                mainLink: String(item.mainLink ?? ""),
                descriptions: normalizeDescriptions(item.descriptions ?? []),
                taggedUser: "",
                taggedLink: String(item.taggedLink ?? ""),
                additionalBrief: briefText(item.additionalBrief),
            },
        });
    });

    return syncBlocksWithAccounts({
        accounts,
        blocks,
    });
};
