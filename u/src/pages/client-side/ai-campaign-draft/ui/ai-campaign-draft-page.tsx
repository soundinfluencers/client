import { ObjectId } from "bson";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    CampaignDraftConflictError,
    getCampaignDraft,
    updateCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api";
import type {
    CampaignDraftDto,
    DraftAddedAccountDto,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import {
    buildAiDraftPayload as buildPayload,
    draftAccountKey as accountKey,
    EMPTY_DRAFT_DETAILS as EMPTY_DETAILS,
    formatCompactNumber,
    formatDraftCurrency as formatCurrency,
    getContentForDraftAccount as getContentForAccount,
    getDraftContentReadiness as getContentReadiness,
    getDraftContentStatus as getContentStatus,
    getDraftDetailsForm as getDetailsForm,
    getDraftSocialMediaGroup as getSocialMediaGroup,
    getAiDraftPayloadSignature as getPayloadSignature,
    getSelectedContentRef,
    normalizeDraftPlatform as normalizePlatform,
    validateDraftDetails as validateDetails,
    type CampaignContentItem,
    type DraftDetailsErrors as DetailsErrors,
    type DraftDetailsForm as DetailsForm,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";
import { CampaignRequiredDateControl } from "@/entities/client-side/campaign-draft/ui/campaign-required-date-control.tsx";
import { CampaignAddPagesDrawer } from "@/entities/client-side/campaign-draft/ui/campaign-add-pages-drawer.tsx";

import styles from "./ai-campaign-draft-page.module.scss";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

type ActionMenuState = {
    key: string;
    top: number;
    left: number;
};

export const AiCampaignDraftPage = () => {
    const { draftId = "" } = useParams();
    const navigate = useNavigate();

    const [draft, setDraft] = React.useState<CampaignDraftDto | null>(null);
    const [accounts, setAccounts] = React.useState<DraftAddedAccountDto[]>([]);
    const [noContentAvailable, setNoContentAvailable] = React.useState(false);
    const [editingAccountKey, setEditingAccountKey] = React.useState<string | null>(null);
    const [detailsForm, setDetailsForm] = React.useState<DetailsForm>(EMPTY_DETAILS);
    const [detailsErrors, setDetailsErrors] = React.useState<DetailsErrors>({});
    const [applyToAll, setApplyToAll] = React.useState(false);
    const [confirmApplyToAll, setConfirmApplyToAll] = React.useState(false);
    const [actionMenu, setActionMenu] = React.useState<ActionMenuState | null>(null);
    const [addPagesOpen, setAddPagesOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");

    const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedPayloadRef = React.useRef("");
    const lastQueuedPayloadRef = React.useRef("");
    const saveQueueRef = React.useRef<Promise<boolean>>(Promise.resolve(true));
    const revisionRef = React.useRef(0);
    const detailsInitialRef = React.useRef("");
    const detailsFirstFieldRef = React.useRef<HTMLInputElement | null>(null);
    const detailsTriggerRef = React.useRef<HTMLButtonElement | null>(null);
    const actionMenuTriggerRef = React.useRef<HTMLButtonElement | null>(null);
    const actionMenuItemRef = React.useRef<HTMLButtonElement | null>(null);

    const loadDraft = React.useCallback(async () => {
        if (!draftId) return;

        setIsLoading(true);
        setLoadError(false);

        try {
            const nextDraft = await getCampaignDraft(draftId);
            const nextAccounts = (nextDraft.addedAccounts ?? []).map((account) => ({
                ...account,
                isSelected: account.isAvailable !== false && account.isSelected !== false,
                dateRequest: account.dateRequest || "ASAP",
            }));
            const nextNoContent = Boolean(nextDraft.noContentAvailable);
            const signature = getPayloadSignature(
                buildPayload(nextDraft, nextAccounts, nextNoContent),
            );

            setDraft(nextDraft);
            revisionRef.current = Number(nextDraft.revision ?? 0);
            setAccounts(nextAccounts);
            setNoContentAvailable(nextNoContent);
            lastSavedPayloadRef.current = signature;
            lastQueuedPayloadRef.current = signature;
            setSaveStatus("saved");
        } catch {
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }, [draftId]);

    React.useEffect(() => {
        void loadDraft();
    }, [loadDraft]);

    const selectedAccounts = React.useMemo(
        () => accounts.filter(
            (account) => account.isAvailable !== false && account.isSelected !== false,
        ),
        [accounts],
    );
    const totalPrice = React.useMemo(
        () => selectedAccounts.reduce((sum, account) => sum + Number(account.price ?? 0), 0),
        [selectedAccounts],
    );
    const totalFollowers = React.useMemo(
        () => selectedAccounts.reduce((sum, account) => sum + Number(account.followers ?? 0), 0),
        [selectedAccounts],
    );
    const platforms = React.useMemo(
        () => Array.from(new Set(selectedAccounts.map((account) => account.socialMedia)))
            .map(normalizePlatform)
            .join(" + ") || "-",
        [selectedAccounts],
    );
    const editingAccount = React.useMemo(
        () => accounts.find((account) => accountKey(account) === editingAccountKey) ?? null,
        [accounts, editingAccountKey],
    );
    const existingAccountIds = React.useMemo(
        () => new Set(accounts.map((account) => String(account.socialAccountId))),
        [accounts],
    );
    const applyAllOverwriteCount = React.useMemo(() => {
        if (!draft || !editingAccount || !applyToAll) return 0;
        const editingKey = accountKey(editingAccount);
        return selectedAccounts.filter((account) =>
            accountKey(account) !== editingKey &&
            getContentStatus(getContentForAccount(draft, account)) !== "empty",
        ).length;
    }, [applyToAll, draft, editingAccount, selectedAccounts]);
    const detailsAreDirty = React.useMemo(
        () => JSON.stringify({ detailsForm, applyToAll }) !== detailsInitialRef.current,
        [applyToAll, detailsForm],
    );

    React.useEffect(() => {
        if (totalPrice <= 1000 && noContentAvailable) {
            setNoContentAvailable(false);
        }
    }, [noContentAvailable, totalPrice]);

    const persistDraft = React.useCallback((
        currentDraft: CampaignDraftDto,
        currentAccounts: DraftAddedAccountDto[],
        currentNoContent: boolean,
    ) => {
        const payload = buildPayload(currentDraft, currentAccounts, currentNoContent);
        const signature = getPayloadSignature(payload);

        if (
            signature === lastSavedPayloadRef.current &&
            signature === lastQueuedPayloadRef.current
        ) {
            return Promise.resolve(true);
        }
        if (signature === lastQueuedPayloadRef.current) return saveQueueRef.current;

        lastQueuedPayloadRef.current = signature;
        setSaveStatus("saving");

        const request = saveQueueRef.current
            .catch(() => false)
            .then(async () => {
                try {
                    const result = await updateCampaignDraft({
                        ...payload,
                        revision: revisionRef.current,
                    });
                    revisionRef.current = result.revision;
                    setDraft((current) => current
                        ? { ...current, revision: result.revision }
                        : current,
                    );
                    lastSavedPayloadRef.current = signature;
                    if (lastQueuedPayloadRef.current === signature) setSaveStatus("saved");
                    return true;
                } catch (error) {
                    if (lastQueuedPayloadRef.current === signature) {
                        setSaveStatus(
                            error instanceof CampaignDraftConflictError
                                ? "conflict"
                                : "error",
                        );
                    }
                    return false;
                }
            });

        saveQueueRef.current = request;
        return request;
    }, []);

    React.useEffect(() => {
        if (!draft) return;

        const signature = getPayloadSignature(
            buildPayload(draft, accounts, noContentAvailable),
        );
        if (
            signature === lastSavedPayloadRef.current &&
            signature === lastQueuedPayloadRef.current
        ) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void persistDraft(draft, accounts, noContentAvailable);
        }, 600);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [accounts, draft, noContentAvailable, persistDraft]);

    const updateAccount = React.useCallback(
        (key: string, patch: Partial<DraftAddedAccountDto>) => {
            setAccounts((current) => current.map((account) =>
                accountKey(account) === key ? { ...account, ...patch } : account,
            ));
        },
        [],
    );

    const addPages = React.useCallback((newAccounts: DraftAddedAccountDto[]) => {
        setAccounts((current) => {
            const existingIds = new Set(
                current.map((account) => String(account.socialAccountId)),
            );
            return [
                ...current,
                ...newAccounts.filter(
                    (account) => !existingIds.has(String(account.socialAccountId)),
                ),
            ];
        });
        toast.success(
            `${newAccounts.length} ${newAccounts.length === 1 ? "page" : "pages"} added to the draft.`,
        );
    }, []);

    const closeAddPages = React.useCallback(() => setAddPagesOpen(false), []);

    const closeDetails = React.useCallback((force = false) => {
        if (!force && detailsAreDirty && !window.confirm("Discard unsaved content changes?")) return;

        setEditingAccountKey(null);
        setDetailsErrors({});
        setApplyToAll(false);
        setConfirmApplyToAll(false);
        window.setTimeout(() => detailsTriggerRef.current?.focus(), 0);
    }, [detailsAreDirty]);

    React.useEffect(() => {
        if (!editingAccountKey) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.setTimeout(() => detailsFirstFieldRef.current?.focus(), 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeDetails();
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeDetails, editingAccountKey]);

    React.useEffect(() => {
        if (!actionMenu) return;

        window.setTimeout(() => actionMenuItemRef.current?.focus(), 0);
        const closeMenu = (event: PointerEvent) => {
            if (!(event.target as HTMLElement).closest("[data-draft-actions]")) {
                setActionMenu(null);
            }
        };
        const closeMenuWithKeyboard = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setActionMenu(null);
            actionMenuTriggerRef.current?.focus();
        };
        const closeOnViewportChange = () => setActionMenu(null);

        document.addEventListener("pointerdown", closeMenu);
        document.addEventListener("keydown", closeMenuWithKeyboard);
        window.addEventListener("resize", closeOnViewportChange);
        window.addEventListener("scroll", closeOnViewportChange, true);

        return () => {
            document.removeEventListener("pointerdown", closeMenu);
            document.removeEventListener("keydown", closeMenuWithKeyboard);
            window.removeEventListener("resize", closeOnViewportChange);
            window.removeEventListener("scroll", closeOnViewportChange, true);
        };
    }, [actionMenu]);

    const openDetails = React.useCallback((
        account: DraftAddedAccountDto,
        trigger: HTMLButtonElement,
    ) => {
        if (!draft) return;

        const form = getDetailsForm(getContentForAccount(draft, account));
        detailsTriggerRef.current = trigger;
        detailsInitialRef.current = JSON.stringify({ detailsForm: form, applyToAll: false });
        setDetailsForm(form);
        setDetailsErrors({});
        setApplyToAll(false);
        setConfirmApplyToAll(false);
        setEditingAccountKey(accountKey(account));
        setActionMenu(null);
    }, [draft]);

    const updateDetailsField = React.useCallback((field: keyof DetailsForm, value: string) => {
        setDetailsForm((current) => ({ ...current, [field]: value }));
        setDetailsErrors((current) => ({ ...current, [field]: undefined }));
        setConfirmApplyToAll(false);
    }, []);

    const saveDetails = React.useCallback(() => {
        if (!editingAccount || !draft) return;

        const errors = validateDetails(detailsForm);
        if (Object.keys(errors).length) {
            setDetailsErrors(errors);
            return;
        }

        const targets = applyToAll ? selectedAccounts : [editingAccount];
        const targetKeys = new Set(targets.map(accountKey));

        const contentByAccount = new Map<string, {
            content: CampaignContentItem;
            selectedContent: NonNullable<DraftAddedAccountDto["selectedContent"]>;
        }>();

        targets.forEach((account) => {
            const contentId = new ObjectId().toHexString();
            const descriptionId = new ObjectId().toHexString();
            const selectedContent = {
                campaignContentItemId: contentId,
                descriptionId,
            };
            contentByAccount.set(accountKey(account), {
                selectedContent,
                content: {
                    _id: contentId,
                    socialMedia: account.socialMedia,
                    socialMediaGroup: getSocialMediaGroup(account.socialMedia),
                    profileType: account.profileType,
                    mainLink: detailsForm.contentUrl.trim(),
                    descriptions: [{
                        _id: descriptionId,
                        description: detailsForm.description.trim(),
                    }],
                    taggedUser: detailsForm.storyTag.trim(),
                    taggedLink: detailsForm.storyLink.trim(),
                    additionalBrief: detailsForm.additionalBrief.trim(),
                },
            });
        });

        const replacedContentIds = new Set(
            targets
                .map(getSelectedContentRef)
                .filter(Boolean)
                .map((item) => String(item?.campaignContentItemId)),
        );
        const retainedContentIds = new Set(
            accounts
                .filter((account) => !targetKeys.has(accountKey(account)))
                .map(getSelectedContentRef)
                .filter(Boolean)
                .map((item) => String(item?.campaignContentItemId)),
        );

        setDraft((current) => current
            ? {
                ...current,
                campaignContent: [
                    ...(current.campaignContent ?? []).filter((item) =>
                        !replacedContentIds.has(String(item._id)) ||
                        retainedContentIds.has(String(item._id)),
                    ),
                    ...Array.from(contentByAccount.values(), ({ content }) => content),
                ],
            }
            : current,
        );
        setAccounts((current) => current.map((account) => {
            const nextContent = contentByAccount.get(accountKey(account));
            return nextContent
                ? {
                    ...account,
                    selectedContent: nextContent.selectedContent,
                    selectedCampaignContentItem: nextContent.selectedContent,
                }
                : account;
        }));

        toast.success(
            applyToAll
                ? `Content details applied to ${targets.length} selected pages.`
                : `Content details saved for ${editingAccount.username}.`,
        );
        detailsInitialRef.current = JSON.stringify({ detailsForm, applyToAll });
        closeDetails(true);
    }, [accounts, applyToAll, closeDetails, detailsForm, draft, editingAccount, selectedAccounts]);

    const handleSaveDetails = React.useCallback(() => {
        if (applyAllOverwriteCount > 0 && !confirmApplyToAll) {
            setConfirmApplyToAll(true);
            return;
        }
        saveDetails();
    }, [applyAllOverwriteCount, confirmApplyToAll, saveDetails]);

    const removeAccount = React.useCallback((key: string) => {
        const index = accounts.findIndex((account) => accountKey(account) === key);
        if (index < 0) return;

        const removedAccount = accounts[index];
        const removedContentId = String(
            getSelectedContentRef(removedAccount)?.campaignContentItemId ?? "",
        );
        const removedContent = draft?.campaignContent?.find(
            (item) => String(item._id) === removedContentId,
        );
        const contentStillUsed = accounts.some((account, accountIndex) =>
            accountIndex !== index &&
            String(getSelectedContentRef(account)?.campaignContentItemId ?? "") === removedContentId,
        );
        setAccounts((current) => current.filter((account) => accountKey(account) !== key));
        if (removedContentId && !contentStillUsed) {
            setDraft((current) => current
                ? {
                    ...current,
                    campaignContent: (current.campaignContent ?? []).filter(
                        (item) => String(item._id) !== removedContentId,
                    ),
                }
                : current,
            );
        }
        setActionMenu(null);
        if (editingAccountKey === key) closeDetails(true);

        toast(({ closeToast }) => (
            <div className={styles.undoToast}>
                <span>{removedAccount.username} removed from the draft.</span>
                <button
                    type="button"
                    onClick={() => {
                        setAccounts((current) => {
                            if (current.some((account) => accountKey(account) === key)) return current;
                            const next = [...current];
                            next.splice(Math.min(index, next.length), 0, removedAccount);
                            return next;
                        });
                        if (removedContent) {
                            setDraft((current) => current &&
                                !(current.campaignContent ?? []).some(
                                    (item) => String(item._id) === removedContentId,
                                )
                                ? {
                                    ...current,
                                    campaignContent: [
                                        ...(current.campaignContent ?? []),
                                        removedContent,
                                    ],
                                }
                                : current,
                            );
                        }
                        closeToast?.();
                    }}
                >
                    Undo
                </button>
            </div>
        ), {
            autoClose: 7000,
            closeButton: false,
        });
    }, [accounts, closeDetails, draft, editingAccountKey]);

    const toggleActionMenu = React.useCallback((
        key: string,
        trigger: HTMLButtonElement,
    ) => {
        if (actionMenu?.key === key) {
            setActionMenu(null);
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const menuWidth = 190;
        actionMenuTriggerRef.current = trigger;
        setActionMenu({
            key,
            top: rect.bottom + 6,
            left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
        });
    }, [actionMenu]);

    const handleDrawerKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Tab") return;

        const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
                "button:not([disabled]), input:not([disabled]), textarea:not([disabled])",
            ),
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }, []);

    const saveAndNavigate = React.useCallback(async (
        path: string,
        requireSelection = true,
    ) => {
        if (!draft || (requireSelection && selectedAccounts.length === 0)) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const saved = await persistDraft(draft, accounts, noContentAvailable);

        if (!saved) {
            toast.error("Could not save the draft. Please retry before continuing.");
            return;
        }

        navigate(path);
    }, [accounts, draft, navigate, noContentAvailable, persistDraft, selectedAccounts.length]);

    if (isLoading) {
        return <div className={styles.state}>Loading campaign draft...</div>;
    }

    if (loadError || !draft) {
        return (
            <div className={styles.state}>
                <h1>Campaign draft unavailable</h1>
                <p>It may have been removed, or it does not belong to this account.</p>
                <button type="button" onClick={() => void loadDraft()}>Retry</button>
            </div>
        );
    }

    const actionMenuAccount = actionMenu
        ? accounts.find((account) => accountKey(account) === actionMenu.key)
        : null;

    return (
        <>
            <main className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <button type="button" className={styles.back} onClick={() => navigate("/ai-chat")}>
                            &larr; Back to chat
                        </button>
                        <h1>{draft.campaignName || "Campaign draft"}</h1>
                        <p>Review the AI shortlist. Uncheck a page to exclude it without removing it.</p>
                    </div>
                    <div className={`${styles.saveStatus} ${["error", "conflict"].includes(saveStatus) ? styles.saveError : ""}`} aria-live="polite">
                        {saveStatus === "saving" && "Saving..."}
                        {saveStatus === "saved" && "Saved"}
                        {saveStatus === "error" && (
                            <button
                                type="button"
                                onClick={() => void persistDraft(draft, accounts, noContentAvailable)}
                            >
                                Save failed - Retry
                            </button>
                        )}
                        {saveStatus === "conflict" && (
                            <button type="button" onClick={() => void loadDraft()}>
                                Draft changed elsewhere - Reload latest
                            </button>
                        )}
                    </div>
                </div>

                <section className={styles.summary} aria-label="Campaign summary">
                    <article>
                        <span>Total reach</span>
                        <strong>{formatCompactNumber(totalFollowers)}</strong>
                        <small>{totalFollowers.toLocaleString("en")} followers</small>
                    </article>
                    <article>
                        <span>Total budget</span>
                        <strong>{formatCurrency(totalPrice)}</strong>
                        <small>Selected pages only</small>
                    </article>
                    <article>
                        <span>Number of posts</span>
                        <strong>{selectedAccounts.length}</strong>
                        <small>Selected placements</small>
                    </article>
                    <article>
                        <span>Platform</span>
                        <strong className={styles.platformValue}>{platforms}</strong>
                        <small>{platforms === "-" ? "Select at least one page" : "Campaign network"}</small>
                    </article>
                </section>

                <section className={styles.draftCard}>
                    <div className={styles.tableHeader}>
                        <div>
                            <h2>Campaign pages</h2>
                            <p>{selectedAccounts.length} of {accounts.length} included · live prices &amp; reach</p>
                        </div>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => setAddPagesOpen(true)}
                            disabled={saveStatus === "saving"}
                        >
                            + Add pages
                        </button>
                    </div>

                    <div className={styles.tableScroll}>
                        <table>
                            <thead>
                                <tr>
                                    <th aria-label="Included" />
                                    <th>Network</th>
                                    <th>Followers</th>
                                    <th>Price</th>
                                    <th>Required date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => {
                                    const key = accountKey(account);
                                    const isAvailable = account.isAvailable !== false;
                                    const isSelected = isAvailable && account.isSelected !== false;
                                    const content = getContentForAccount(draft, account);
                                    const contentReadiness = getContentReadiness(content);
                                    const contentStatus = contentReadiness.status;
                                    return (
                                        <tr key={key} className={isSelected ? "" : styles.disabledRow}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={!isAvailable}
                                                    onChange={(event) => updateAccount(key, {
                                                        isSelected: event.target.checked,
                                                    })}
                                                    aria-label={`${isSelected ? "Exclude" : "Include"} ${account.username}`}
                                                />
                                            </td>
                                            <td>
                                                <div className={styles.network}>
                                                    {account.logoUrl
                                                        ? <img src={account.logoUrl} alt="" />
                                                        : <span className={styles.avatarFallback} />}
                                                    <div>
                                                        <strong>{account.username}</strong>
                                                        <span>{normalizePlatform(account.socialMedia)}</span>
                                                        <span className={`${styles.contentStatus} ${styles[`contentStatus_${isAvailable ? contentStatus : "incomplete"}`]}`}>
                                                            {isAvailable ? contentReadiness.label : "Page unavailable"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{Number(account.followers ?? 0).toLocaleString("en")}</td>
                                            <td className={styles.price}>{formatCurrency(Number(account.price ?? 0))}</td>
                                            <td>
                                                <CampaignRequiredDateControl
                                                    className={styles.dateField}
                                                    value={account.dateRequest}
                                                    disabled={!isSelected}
                                                    label={account.username}
                                                    onChange={(dateRequest) => updateAccount(key, { dateRequest })}
                                                />
                                            </td>
                                            <td>
                                                <div className={styles.rowActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.detailsButton}
                                                        onClick={(event) => openDetails(account, event.currentTarget)}
                                                        disabled={!isSelected}
                                                        data-edit-key={key}
                                                    >
                                                        Edit details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.moreButton}
                                                        aria-label={`More actions for ${account.username}`}
                                                        aria-haspopup="menu"
                                                        aria-expanded={actionMenu?.key === key}
                                                        onClick={(event) => toggleActionMenu(key, event.currentTarget)}
                                                        data-draft-actions
                                                    >
                                                        <span aria-hidden="true">...</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {accounts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyTable}>
                                            <strong>No pages in this draft</strong>
                                            <span>Add pages to continue building the campaign.</span>
                                            <button
                                                type="button"
                                                onClick={() => setAddPagesOpen(true)}
                                            >
                                                Add pages
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {totalPrice > 1000 && (
                    <label className={styles.contentOption}>
                        <input
                            type="checkbox"
                            checked={noContentAvailable}
                            onChange={(event) => setNoContentAvailable(event.target.checked)}
                        />
                        <span>
                            <strong>Need creative support?</strong>
                            <small>Ask our team to prepare campaign-ready meme content.</small>
                        </span>
                    </label>
                )}

                {selectedAccounts.length === 0 && accounts.length > 0 && (
                    <p className={styles.selectionError}>Select at least one page to continue.</p>
                )}

                <div className={styles.actions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => navigate("/ai-chat")}>
                        Back to chat
                    </button>
                    <button
                        ref={actionMenuItemRef}
                        type="button"
                        className={styles.primaryButton}
                        disabled={selectedAccounts.length === 0 || saveStatus === "saving"}
                        onClick={() => void saveAndNavigate(`/client/create-campaign?draftId=${draft._id}&source=ai`)}
                    >
                        Customize campaign
                    </button>
                </div>
            </main>

            {actionMenu && actionMenuAccount && (
                <div
                    className={styles.actionMenu}
                    style={{ top: actionMenu.top, left: actionMenu.left }}
                    role="menu"
                    aria-label={`Actions for ${actionMenuAccount.username}`}
                    data-draft-actions
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => removeAccount(actionMenu.key)}
                    >
                        Remove from draft
                    </button>
                </div>
            )}

            <CampaignAddPagesDrawer
                open={addPagesOpen}
                existingAccountIds={existingAccountIds}
                onClose={closeAddPages}
                onAdd={addPages}
                onAdvancedSearch={() => {
                    closeAddPages();
                    void saveAndNavigate(
                        `/client/create-campaign?draftId=${draft._id}&previewTarget=accounts&source=ai&mode=ai-add-pages&returnTo=${encodeURIComponent(`/client/campaign-draft/${draft._id}`)}`,
                        false,
                    );
                }}
            />

            {editingAccount && (
                <div
                    className={styles.drawerOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeDetails();
                    }}
                >
                    <section
                        className={styles.drawer}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="campaign-content-title"
                        onKeyDown={handleDrawerKeyDown}
                    >
                        <header className={styles.drawerHeader}>
                            <div>
                                <span>{normalizePlatform(editingAccount.socialMedia)}</span>
                                <h2 id="campaign-content-title">Content for {editingAccount.username}</h2>
                            </div>
                            <button type="button" onClick={() => closeDetails()} aria-label="Close content details">
                                &times;
                            </button>
                        </header>

                        <div className={styles.drawerBody}>
                            <p className={styles.drawerIntro}>
                                Add account-specific publishing details. A content URL and post description mark this page as ready.
                            </p>

                            <label className={styles.field}>
                                <span>Content URL</span>
                                <input
                                    ref={detailsFirstFieldRef}
                                    type="url"
                                    value={detailsForm.contentUrl}
                                    onChange={(event) => updateDetailsField("contentUrl", event.target.value)}
                                    placeholder="https://..."
                                    maxLength={2000}
                                    aria-invalid={Boolean(detailsErrors.contentUrl)}
                                />
                                {detailsErrors.contentUrl && <small role="alert">{detailsErrors.contentUrl}</small>}
                            </label>

                            <label className={styles.field}>
                                <span>Post description</span>
                                <textarea
                                    value={detailsForm.description}
                                    onChange={(event) => updateDetailsField("description", event.target.value)}
                                    placeholder="What should be published with the post?"
                                    rows={5}
                                    maxLength={2000}
                                />
                            </label>

                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    <span>Story tag</span>
                                    <input
                                        type="text"
                                        value={detailsForm.storyTag}
                                        onChange={(event) => updateDetailsField("storyTag", event.target.value)}
                                        placeholder="@artist"
                                        maxLength={100}
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>Story link</span>
                                    <input
                                        type="url"
                                        value={detailsForm.storyLink}
                                        onChange={(event) => updateDetailsField("storyLink", event.target.value)}
                                        placeholder="https://..."
                                        maxLength={2000}
                                        aria-invalid={Boolean(detailsErrors.storyLink)}
                                    />
                                    {detailsErrors.storyLink && <small role="alert">{detailsErrors.storyLink}</small>}
                                </label>
                            </div>

                            <label className={styles.field}>
                                <span>Additional brief</span>
                                <textarea
                                    value={detailsForm.additionalBrief}
                                    onChange={(event) => updateDetailsField("additionalBrief", event.target.value)}
                                    placeholder="Timing, tone, visual direction, or other instructions"
                                    rows={4}
                                    maxLength={2000}
                                />
                            </label>

                            <label className={styles.applyAllOption}>
                                <input
                                    type="checkbox"
                                    checked={applyToAll}
                                    onChange={(event) => {
                                        setApplyToAll(event.target.checked);
                                        setConfirmApplyToAll(false);
                                    }}
                                />
                                <span>
                                    <strong>Apply these details to all selected pages</strong>
                                    <small>
                                        {applyAllOverwriteCount > 0
                                            ? `This will replace existing details for ${applyAllOverwriteCount} other ${applyAllOverwriteCount === 1 ? "page" : "pages"}.`
                                            : `Only selected pages will receive a separate editable copy.`}
                                    </small>
                                </span>
                            </label>
                            {confirmApplyToAll && applyAllOverwriteCount > 0 && (
                                <div className={styles.overwriteWarning} role="alert">
                                    <strong>Existing content will be replaced</strong>
                                    <span>
                                        Review the change, then confirm replacement for {applyAllOverwriteCount} {applyAllOverwriteCount === 1 ? "page" : "pages"}.
                                    </span>
                                </div>
                            )}
                        </div>

                        <footer className={styles.drawerFooter}>
                            <span>{detailsAreDirty ? "Unsaved changes" : "No unsaved changes"}</span>
                            <div>
                                <button type="button" className={styles.secondaryButton} onClick={() => closeDetails()}>
                                    Cancel
                                </button>
                                <button type="button" className={styles.primaryButton} onClick={handleSaveDetails}>
                                    {confirmApplyToAll && applyAllOverwriteCount > 0
                                        ? `Replace details for ${applyAllOverwriteCount} ${applyAllOverwriteCount === 1 ? "page" : "pages"}`
                                        : applyAllOverwriteCount > 0 ? "Review overwrite" : "Save details"}
                                </button>
                            </div>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
};
