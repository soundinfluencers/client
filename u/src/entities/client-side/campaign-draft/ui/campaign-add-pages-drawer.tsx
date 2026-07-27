import React from "react";

import { searchPromoAccounts } from "@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.api.ts";
import type { PromoAccount } from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";
import type { DraftAddedAccountDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";

import styles from "./campaign-add-pages-drawer.module.scss";

type PlatformFilter = "all" | "instagram" | "tiktok";

type Props = {
    open: boolean;
    existingAccountIds: Set<string>;
    onClose: () => void;
    onAdd: (accounts: DraftAddedAccountDto[]) => void;
    onAdvancedSearch: () => void;
};

const mapResultToDraftAccount = (account: PromoAccount): DraftAddedAccountDto => ({
    influencerId: account.influencerId,
    socialAccountId: account.accountId,
    socialMedia: account.socialMedia,
    username: account.username,
    logoUrl: account.logoUrl,
    followers: account.followers,
    price: Number(account.prices?.EUR ?? 0),
    dateRequest: "ASAP",
    isSelected: true,
    isAvailable: true,
    profileType: account.profileType,
});

export const CampaignAddPagesDrawer = ({
    open,
    existingAccountIds,
    onClose,
    onAdd,
    onAdvancedSearch,
}: Props) => {
    const [query, setQuery] = React.useState("");
    const [platform, setPlatform] = React.useState<PlatformFilter>("all");
    const [results, setResults] = React.useState<PromoAccount[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        searchInputRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, open]);

    React.useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
            setSelectedIds(new Set());
            setError("");
        }
    }, [open]);

    const handleSearch = async (event: React.FormEvent) => {
        event.preventDefault();
        const normalizedQuery = query.trim();
        if (normalizedQuery.length < 2) {
            setError("Enter at least 2 characters.");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const accounts = await searchPromoAccounts({
                query: normalizedQuery,
                socialMedias: platform === "all" ? ["instagram", "tiktok"] : [platform],
                page: 1,
                limit: 20,
            });
            setResults(accounts);
            setSelectedIds((current) => new Set(
                [...current].filter((id) => accounts.some((account) => account.accountId === id)),
            ));
        } catch {
            setError("Could not load pages. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleResult = (accountId: string) => {
        if (existingAccountIds.has(accountId)) return;
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(accountId)) next.delete(accountId);
            else next.add(accountId);
            return next;
        });
    };

    const addSelected = () => {
        const selected = results
            .filter((account) => selectedIds.has(account.accountId))
            .map(mapResultToDraftAccount);
        if (!selected.length) return;
        onAdd(selected);
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className={styles.drawer}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-campaign-pages-title"
            >
                <header className={styles.header}>
                    <div>
                        <span>Campaign draft</span>
                        <h2 id="add-campaign-pages-title">Add pages</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close add pages">
                        ×
                    </button>
                </header>

                <form className={styles.search} onSubmit={handleSearch}>
                    <input
                        ref={searchInputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by page name"
                    />
                    <select
                        value={platform}
                        onChange={(event) => setPlatform(event.target.value as PlatformFilter)}
                        aria-label="Platform"
                    >
                        <option value="all">Instagram + TikTok</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                    </select>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Searching…" : "Search"}
                    </button>
                </form>

                <div className={styles.body}>
                    {error && <div className={styles.error}>{error}</div>}
                    {!error && !isLoading && results.length === 0 && (
                        <div className={styles.empty}>
                            <strong>Find another campaign page</strong>
                            <span>Search by its exact or partial username.</span>
                        </div>
                    )}
                    {results.map((account) => {
                        const alreadyAdded = existingAccountIds.has(account.accountId);
                        const selected = selectedIds.has(account.accountId);
                        return (
                            <label
                                key={`${account.socialMedia}:${account.accountId}`}
                                className={`${styles.result} ${alreadyAdded ? styles.resultAdded : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={alreadyAdded || selected}
                                    disabled={alreadyAdded}
                                    onChange={() => toggleResult(account.accountId)}
                                />
                                {account.logoUrl
                                    ? <img src={account.logoUrl} alt="" />
                                    : <span className={styles.avatar} />}
                                <span className={styles.resultName}>
                                    <strong>{account.username}</strong>
                                    <small>{account.socialMedia}</small>
                                </span>
                                <span className={styles.metric}>
                                    <strong>{account.followers.toLocaleString("en")}</strong>
                                    <small>followers</small>
                                </span>
                                <span className={styles.price}>
                                    {alreadyAdded ? "Already added" : `€${Number(account.prices?.EUR ?? 0).toLocaleString("en")}`}
                                </span>
                            </label>
                        );
                    })}
                </div>

                <footer className={styles.footer}>
                    <button type="button" className={styles.advanced} onClick={onAdvancedSearch}>
                        Advanced filters
                    </button>
                    <div>
                        <span>{selectedIds.size} selected</span>
                        <button type="button" onClick={addSelected} disabled={selectedIds.size === 0}>
                            Add selected pages
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
};
