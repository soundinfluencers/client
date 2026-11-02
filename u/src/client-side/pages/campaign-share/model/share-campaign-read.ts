import { formatCampaignDate } from "@/utils/functions/formatDate";

const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

export const formatShareMoney = (amount: unknown, currency: unknown, decimals?: number): string =>
    typeof amount === "number" && Number.isFinite(amount) && amount >= 0 &&
    typeof currency === "string" && Object.hasOwn(symbols, currency)
        ? `${decimals === undefined ? amount : amount.toFixed(decimals)}${symbols[currency]}` : "—";

export const formatSavedShareTotal = (campaign: any): string => {
    // A broken Proposal option must not fall back to a different top-level total/currency.
    const saved = campaign?.kind === "proposal" || campaign?.selectedOption !== undefined
        ? campaign?.selectedOption : campaign;
    return formatShareMoney(saved?.price, saved?.displayCurrency);
};

const lifecycleId = (row: any): string | undefined =>
    [row?.addedAccountsId, row?._id].find((id) => typeof id === "string" && id.trim().length > 0);

// Only the ordinary public /share DTO: its row _id is the placement, never a Draft occurrence.
export const toPublicShareCampaign = (raw: any) => !raw || !Array.isArray(raw.addedAccounts) ? raw : ({
    ...raw,
    addedAccounts: raw.addedAccounts.map((row: any) => {
        const id = lifecycleId(row);
        return id ? { ...row, addedAccountsId: id } : { ...row };
    }),
});

export const sharePlacementRows = <T extends Record<string, any>>(rows: T[]) => {
    const counts = new Map<string, number>();
    for (const row of rows) {
        const id = lifecycleId(row);
        if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    // Keep every saved row. Missing/duplicate identity has only a positional UI fallback;
    // it cannot promise stable reconciliation after reorder and is never a transport identity.
    return rows.map((row, index) => {
        const id = lifecycleId(row);
        return { row, key: id && counts.get(id) === 1 ? `placement:${id}` : `unidentified:${index}` };
    });
};

export const formatShareSubmitted = (campaign: any): string => {
    if (campaign?.kind === "proposal" || campaign?.selectedOption !== undefined) return "—";
    const raw = campaign?.creationDate ?? campaign?.submittedAt ?? campaign?.createdAt;
    if (typeof raw !== "string" || !raw.trim()) return "—";
    const text = raw.trim();
    const dotted = /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/.exec(text);
    const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(text);
    if (!dotted && !iso) return "—";
    const year = dotted ? Number(dotted[3]) + (dotted[3].length === 2 ? 2000 : 0) : Number(iso![1]);
    const month = Number(dotted ? dotted[2] : iso![2]);
    const day = Number(dotted ? dotted[1] : iso![3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "—";
    const parsed = iso ? new Date(text) : date;
    return Number.isFinite(parsed.getTime()) ? formatCampaignDate(parsed) : "—";
};
