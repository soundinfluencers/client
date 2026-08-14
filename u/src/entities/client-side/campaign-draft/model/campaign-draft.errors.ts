type UnknownRecord = Record<string, unknown>;

type InvalidCampaignDraftAccount = {
    socialAccountId?: string;
    selectionId?: string;
    reason: string;
};

type InvalidCampaignDraftBundle = {
    bundleId: string;
    reason: string;
};

type InvalidCampaignDraftOffer = {
    offerId: string;
    reason: string;
};

export type ParsedCampaignDraftError = {
    message: string;
    invalidAccounts?: InvalidCampaignDraftAccount[];
    invalidBundles?: InvalidCampaignDraftBundle[];
    invalidOffer?: InvalidCampaignDraftOffer;
};

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const formatReason = (reason: unknown): string =>
    String(reason ?? "unavailable").replaceAll("_", " ");

const getResponsePayload = (error: unknown): unknown => {
    if (!isRecord(error)) return error;

    const response = error.response;

    if (!isRecord(response)) return error;

    return response.data;
};

const parseInvalidAccounts = (
    value: unknown,
): InvalidCampaignDraftAccount[] | undefined => {
    if (!Array.isArray(value)) return undefined;

    const parsed = value
        .filter(isRecord)
        .map((item) => ({
            ...(typeof item.socialAccountId === "string"
                ? { socialAccountId: item.socialAccountId }
                : {}),
            ...(typeof item.selectionId === "string"
                ? { selectionId: item.selectionId }
                : {}),
            reason: String(item.reason ?? "account_unavailable"),
        }));

    return parsed.length > 0 ? parsed : undefined;
};

const parseInvalidBundles = (
    value: unknown,
): InvalidCampaignDraftBundle[] | undefined => {
    if (!Array.isArray(value)) return undefined;

    const parsed = value
        .filter(isRecord)
        .filter((item) => typeof item.bundleId === "string")
        .map((item) => ({
            bundleId: item.bundleId as string,
            reason: String(item.reason ?? "bundle_unavailable"),
        }));

    return parsed.length > 0 ? parsed : undefined;
};

const parseInvalidOffer = (
    value: unknown,
): InvalidCampaignDraftOffer | undefined => {
    if (!isRecord(value) || typeof value.offerId !== "string") {
        return undefined;
    }

    return {
        offerId: value.offerId,
        reason: String(value.reason ?? "offer_unavailable"),
    };
};

export const parseCampaignDraftError = (
    error: unknown,
    fallback = "Failed to save draft",
): ParsedCampaignDraftError => {
    const payload = getResponsePayload(error);
    const body = isRecord(payload) ? payload : undefined;
    const invalidAccounts = parseInvalidAccounts(body?.invalidAccounts);
    const invalidBundles = parseInvalidBundles(body?.invalidBundles);
    const invalidOffer = parseInvalidOffer(body?.invalidOffer);
    const selectionMessages = [
        ...(invalidBundles ?? []).map(
            (bundle) =>
                `Bundle ${bundle.bundleId}: ${formatReason(bundle.reason)}`,
        ),
        ...(invalidOffer
            ? [
                `Offer ${invalidOffer.offerId}: ${formatReason(invalidOffer.reason)}`,
            ]
            : []),
        ...(invalidAccounts ?? []).map((account) => {
            const accountId =
                account.socialAccountId ?? account.selectionId ?? "unknown";

            return `Account ${accountId}: ${formatReason(account.reason)}`;
        }),
    ];

    let message = fallback;

    if (selectionMessages.length > 0) {
        message = selectionMessages.join("; ");
    } else if (Array.isArray(body?.message)) {
        const messages = body.message.map(String).filter(Boolean);
        message = messages.length > 0 ? messages.join("; ") : fallback;
    } else if (typeof body?.message === "string" && body.message.trim()) {
        message = body.message;
    } else if (error instanceof Error && error.message.trim()) {
        message = error.message;
    }

    return {
        message,
        ...(invalidAccounts ? { invalidAccounts } : {}),
        ...(invalidBundles ? { invalidBundles } : {}),
        ...(invalidOffer ? { invalidOffer } : {}),
    };
};
