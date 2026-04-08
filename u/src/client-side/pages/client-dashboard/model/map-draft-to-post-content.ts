import type { CampaignContentItem } from "@/client-side/types/content";

type DraftFormValues = Record<string, string>;
type GroupKey = "main" | "music" | "press";

const buildAdditionalPrefix = (
    group: GroupKey,
    socialMedia: string,
    index: number,
) => `${group}-${socialMedia}-additional-${index}`;

const normalizeItemSignature = (item: CampaignContentItem) => {
    return JSON.stringify({
        socialMediaGroup: item.socialMediaGroup,
        mainLink: item.mainLink ?? "",
        descriptions: (item.descriptions ?? []).map((d) => d.description ?? ""),
        taggedUser: item.taggedUser ?? "",
        taggedLink: item.taggedLink ?? "",
        additionalBrief: item.additionalBrief ?? "",
    });
};

const writeItemToDraft = (
    result: DraftFormValues,
    prefix: string,
    item: CampaignContentItem,
) => {
    if (item.socialMediaGroup === "main") {
        result[`${prefix}-Content link-0`] = item.mainLink ?? "";
        result[`${prefix}-Story tag-1`] = item.taggedUser ?? "";
        result[`${prefix}-Story link-2`] = item.taggedLink ?? "";

        (item.descriptions ?? []).forEach((desc, index) => {
            result[`${prefix}-Postdescription-${index + 1}`] = desc.description ?? "";
        });

        result[`${prefix}-Additional brief-0`] = item.additionalBrief ?? "";
    }

    if (item.socialMediaGroup === "music") {
        result[`${prefix}-Track link-0`] = item.mainLink ?? "";
        result[`${prefix}-Track title-1`] =
            item.descriptions?.[0]?.description ?? "";
        result[`${prefix}-Additional brief-2`] = item.additionalBrief ?? "";
    }

    if (item.socialMediaGroup === "press") {
        result[`${prefix}-Link to music, events, news-0`] = item.mainLink ?? "";
        result[`${prefix}-Link to artwork & press shots-1`] =
            item.descriptions?.[0]?.description ?? "";
        result[`${prefix}-Additional brief-0`] = item.additionalBrief ?? "";
    }
};

export const mapDraftCampaignContentToPostContentDraft = (
    campaignName: string,
    campaignContent: CampaignContentItem[],
): DraftFormValues => {
    const result: DraftFormValues = {
        campaignName: campaignName ?? "",
    };

    const groups: GroupKey[] = ["main", "music", "press"];

    for (const group of groups) {
        const items = (campaignContent ?? []).filter(
            (item) => item.socialMediaGroup === group,
        );

        if (!items.length) continue;

        // ищем самый частый signature — это base
        const signatureCount = new Map<string, number>();

        for (const item of items) {
            const signature = normalizeItemSignature(item);
            signatureCount.set(signature, (signatureCount.get(signature) ?? 0) + 1);
        }

        let baseSignature = "";
        let maxCount = 0;

        for (const [signature, count] of signatureCount.entries()) {
            if (count > maxCount) {
                maxCount = count;
                baseSignature = signature;
            }
        }

        const baseItem =
            items.find((item) => normalizeItemSignature(item) === baseSignature) ??
            items[0];

        writeItemToDraft(result, `${group}-0`, baseItem);

        const additionalItems = items.filter((item, index) => {
            const sameAsBase = normalizeItemSignature(item) === baseSignature;
            if (!sameAsBase) return true;

            const firstBaseIndex = items.findIndex(
                (x) => normalizeItemSignature(x) === baseSignature,
            );

            return index !== firstBaseIndex;
        });

        let additionalIndex = 1;

        for (const item of additionalItems) {
            if (normalizeItemSignature(item) === baseSignature) continue;

            const prefix = buildAdditionalPrefix(
                group,
                item.socialMedia,
                additionalIndex,
            );

            writeItemToDraft(result, prefix, item);
            additionalIndex += 1;
        }
    }

    return result;
};