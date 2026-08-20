export type AdditionalBriefVersion = {
    _id: string;
    additionalBrief: string;
};

type NormalizeAdditionalBriefOptions = {
    createId?: () => string;
};

export const normalizeAdditionalBriefVersions = (
    value: unknown,
    options: NormalizeAdditionalBriefOptions = {},
): AdditionalBriefVersion[] => {
    const normalizeEntry = (entry: unknown): AdditionalBriefVersion | null => {
        if (!entry || typeof entry !== "object") return null;

        const record = entry as Record<string, unknown>;
        const id = String(record._id ?? "").trim() || options.createId?.() || "";
        if (!id) return null;

        return {
            _id: id,
            additionalBrief: String(record.additionalBrief ?? ""),
        };
    };

    if (Array.isArray(value)) {
        return value
            .map(normalizeEntry)
            .filter((entry): entry is AdditionalBriefVersion => entry !== null);
    }

    const legacyText = typeof value === "string" ? value : "";
    if (!legacyText.trim()) return [];

    const id = options.createId?.() ?? "";
    return id ? [{ _id: id, additionalBrief: legacyText }] : [];
};

export const resolveAdditionalBriefId = (
    briefs: readonly AdditionalBriefVersion[],
    selectedId: unknown,
): string | undefined => {
    const normalizedSelectedId = String(selectedId ?? "").trim();
    const selected = briefs.find((brief) => brief._id === normalizedSelectedId);

    return selected?._id || briefs[0]?._id;
};
