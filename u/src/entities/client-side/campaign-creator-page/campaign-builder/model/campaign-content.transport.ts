import { ObjectId } from "bson";
import type { CampaignContentItem, SelectedCampaignContentRef } from "./campaign-builder.types";

const id = () => new ObjectId().toHexString();
const text = (value: unknown): string => {
    if (value == null) return "";
    if (typeof value !== "string") throw new Error("Content text must be a string.");
    return value;
};

// One API boundary for content-save, strategy and ordinary create. UI fields may be text.
export const serializeCampaignContent = <T extends CampaignContentItem>(content: readonly T[]) => content.map((item) => {
    const rawBriefs = typeof item.additionalBrief === "string"
        ? (item.additionalBrief.trim() ? [{ _id: id(), additionalBrief: item.additionalBrief }] : [])
        : item.additionalBrief ?? [];
    return {
        _id: item._id || id(),
        socialMedia: item.socialMedia,
        socialMediaGroup: item.socialMediaGroup,
        mainLink: text(item.mainLink),
        descriptions: (item.descriptions ?? []).map((description) => ({
            _id: description._id || id(), description: text(description.description),
        })),
        taggedUser: text(item.taggedUser),
        taggedLink: text(item.taggedLink),
        additionalBrief: rawBriefs.filter((brief) => text(brief.additionalBrief).trim()).map((brief) => ({
            _id: brief._id || id(), additionalBrief: text(brief.additionalBrief),
        })),
        profileType: item.profileType ?? "community" as const,
    };
});

export const serializeContentReference = (
    reference: SelectedCampaignContentRef | null | undefined,
    content: readonly CampaignContentItem[],
): SelectedCampaignContentRef | null | undefined => {
    if (reference == null) return reference;
    const item = content.find((item) => item._id === reference.campaignContentItemId);
    if (!item) throw new Error("Selected content is missing. Please review the content selection.");
    const briefs = Array.isArray(item.additionalBrief) ? item.additionalBrief : [];
    return {
        campaignContentItemId: item._id,
        // A removed variant becomes null, never another variant. Explicit null stays null.
        descriptionId: reference.descriptionId === null || !item.descriptions.some((d) => d._id === reference.descriptionId)
            ? null : reference.descriptionId,
        ...("additionalBriefId" in reference ? {
            additionalBriefId: reference.additionalBriefId == null ? reference.additionalBriefId
                : briefs.some((b) => b._id === reference.additionalBriefId) ? reference.additionalBriefId : null,
        } : briefs[0] ? { additionalBriefId: briefs[0]._id } : {}),
    };
};
