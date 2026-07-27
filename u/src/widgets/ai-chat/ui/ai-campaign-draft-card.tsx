import { ObjectId } from "bson";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  CampaignDraftConflictError,
  getCampaignDraft,
  updateCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import type {
  CampaignDraftDto,
  DraftAddedAccountDto,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  buildAiDraftPayload,
  draftAccountKey,
  EMPTY_DRAFT_DETAILS,
  formatCompactNumber,
  formatDraftCurrency,
  getContentForDraftAccount,
  getDraftContentStatus,
  getDraftContentReadiness,
  getDraftDetailsForm,
  getDraftSocialMediaGroup,
  getAiDraftPayloadSignature,
  getSelectedContentRef,
  isDraftReadyForCheckout,
  normalizeDraftPlatform,
  validateDraftDetails,
  type CampaignContentItem,
  type DraftDetailsErrors,
  type DraftDetailsForm,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";

import styles from "./ai-campaign-draft-card.module.scss";
import { registerCampaignDraftSave } from "../model/campaign-draft-save-coordinator.ts";
import { CampaignRequiredDateControl } from "@/entities/client-side/campaign-draft/ui/campaign-required-date-control.tsx";
import { CampaignAddPagesDrawer } from "@/entities/client-side/campaign-draft/ui/campaign-add-pages-drawer.tsx";

type SaveStatus = "saved" | "saving" | "error" | "conflict";

interface Props {
  draftId: string;
  onProceedToPayment: (draftId: string) => void;
  onPrompt: (prompt: string) => void;
}

const normalizeAccounts = (draft: CampaignDraftDto) =>
  (draft.addedAccounts ?? []).map((account) => ({
    ...account,
    isSelected: account.isAvailable !== false && account.isSelected !== false,
    dateRequest: account.dateRequest || "ASAP",
  }));

export const AiCampaignDraftCard = ({ draftId, onProceedToPayment, onPrompt }: Props) => {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["campaign-draft", draftId],
    queryFn: () => getCampaignDraft(draftId),
    retry: false,
  });
  const [draft, setDraft] = useState<CampaignDraftDto | null>(null);
  const [accounts, setAccounts] = useState<DraftAddedAccountDto[]>([]);
  const [noContentAvailable, setNoContentAvailable] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [details, setDetails] = useState<DraftDetailsForm>(EMPTY_DRAFT_DETAILS);
  const [detailsErrors, setDetailsErrors] = useState<DraftDetailsErrors>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [confirmApplyToAll, setConfirmApplyToAll] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [addPagesOpen, setAddPagesOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef("");
  const saveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const revisionRef = useRef(0);

  useEffect(() => {
    if (!query.data) return;
    const nextAccounts = normalizeAccounts(query.data);
    const nextNoContent = Boolean(query.data.noContentAvailable);
    setDraft(query.data);
    revisionRef.current = Number(query.data.revision ?? 0);
    setAccounts(nextAccounts);
    setNoContentAvailable(nextNoContent);
    lastSavedRef.current = getAiDraftPayloadSignature(
      buildAiDraftPayload(query.data, nextAccounts, nextNoContent),
    );
    setSaveStatus("saved");
  }, [query.data]);

  const selectedAccounts = useMemo(
    () => accounts.filter(
      (account) => account.isAvailable !== false && account.isSelected !== false,
    ),
    [accounts],
  );
  const totalPrice = useMemo(
    () => selectedAccounts.reduce((sum, account) => sum + Number(account.price ?? 0), 0),
    [selectedAccounts],
  );
  const totalFollowers = useMemo(
    () => selectedAccounts.reduce((sum, account) => sum + Number(account.followers ?? 0), 0),
    [selectedAccounts],
  );
  const platforms = useMemo(
    () => Array.from(new Set(selectedAccounts.map((account) => account.socialMedia)))
      .map(normalizeDraftPlatform)
      .join(" + ") || "-",
    [selectedAccounts],
  );
  const editingAccount = useMemo(
    () => accounts.find((account) => draftAccountKey(account) === editingKey) ?? null,
    [accounts, editingKey],
  );
  const existingAccountIds = useMemo(
    () => new Set(accounts.map((account) => String(account.socialAccountId))),
    [accounts],
  );
  const contentIsReady = useMemo(
    () => Boolean(draft && isDraftReadyForCheckout(draft, accounts)),
    [accounts, draft],
  );
  const allReadyContentIsAssigned = useMemo(
    () => contentIsReady && selectedAccounts.every((account) => Boolean(getSelectedContentRef(account))),
    [contentIsReady, selectedAccounts],
  );
  const canCheckout = allReadyContentIsAssigned;

  useEffect(() => {
    if (!draft || draft.step === "strategyTable" || !allReadyContentIsAssigned) return;
    setDraft((current) => current ? { ...current, step: "strategyTable" } : current);
  }, [allReadyContentIsAssigned, draft]);

  useEffect(() => {
    if (totalPrice <= 1000 && noContentAvailable) setNoContentAvailable(false);
  }, [noContentAvailable, totalPrice]);

  const persist = useCallback(() => {
    if (!draft) return Promise.resolve(false);
    const payload = buildAiDraftPayload(draft, accounts, noContentAvailable);
    const signature = getAiDraftPayloadSignature(payload);
    if (signature === lastSavedRef.current) return Promise.resolve(true);

    setSaveStatus("saving");
    const request = saveQueueRef.current.then(async () => {
      try {
        const result = await updateCampaignDraft({
          ...payload,
          revision: revisionRef.current,
        });
        revisionRef.current = result.revision;
        setDraft((current) => current
          ? { ...current, revision: result.revision }
          : current);
        lastSavedRef.current = signature;
        setSaveStatus("saved");
        return true;
      } catch (error) {
        setSaveStatus(
          error instanceof CampaignDraftConflictError ? "conflict" : "error",
        );
        return false;
      }
    });
    saveQueueRef.current = request;
    return request;
  }, [accounts, draft, noContentAvailable]);

  useEffect(() => {
    if (!draft) return;
    return registerCampaignDraftSave(draftId, persist);
  }, [draft, draftId, persist]);

  useEffect(() => {
    if (!draft) return;
    const signature = getAiDraftPayloadSignature(
      buildAiDraftPayload(draft, accounts, noContentAvailable),
    );
    if (signature === lastSavedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void persist(), 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [accounts, draft, noContentAvailable, persist]);

  const updateAccount = (key: string, patch: Partial<DraftAddedAccountDto>) => {
    setAccounts((current) => current.map((account) =>
      draftAccountKey(account) === key ? { ...account, ...patch } : account,
    ));
  };

  const addPages = useCallback((newAccounts: DraftAddedAccountDto[]) => {
    setAccounts((current) => {
      const existingIds = new Set(current.map((account) => String(account.socialAccountId)));
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

  const closeAddPages = useCallback(() => setAddPagesOpen(false), []);

  const openDetails = (account: DraftAddedAccountDto) => {
    if (!draft) return;
    setEditingKey(draftAccountKey(account));
    setDetails(getDraftDetailsForm(getContentForDraftAccount(draft, account)));
    setDetailsErrors({});
    setApplyToAll(false);
    setConfirmApplyToAll(false);
  };

  const closeDetails = () => {
    setEditingKey(null);
    setDetailsErrors({});
    setApplyToAll(false);
    setConfirmApplyToAll(false);
  };

  const updateDetails = (field: keyof DraftDetailsForm, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setDetailsErrors((current) => ({ ...current, [field]: undefined }));
    setConfirmApplyToAll(false);
  };

  useEffect(() => {
    if (!editingKey) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetails();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [editingKey]);

  const saveDetails = () => {
    if (!draft || !editingAccount) return;
    const errors = validateDraftDetails(details);
    if (Object.keys(errors).length) {
      setDetailsErrors(errors);
      return;
    }

    const targets = applyToAll ? selectedAccounts : [editingAccount];
    const targetKeys = new Set(targets.map(draftAccountKey));
    const contentByAccount = new Map<string, {
      content: CampaignContentItem;
      selectedContent: NonNullable<DraftAddedAccountDto["selectedContent"]>;
    }>();

    targets.forEach((account) => {
      const contentId = new ObjectId().toHexString();
      const descriptionId = new ObjectId().toHexString();
      contentByAccount.set(draftAccountKey(account), {
        selectedContent: { campaignContentItemId: contentId, descriptionId },
        content: {
          _id: contentId,
          socialMedia: account.socialMedia,
          socialMediaGroup: getDraftSocialMediaGroup(account.socialMedia),
          profileType: account.profileType,
          mainLink: details.contentUrl.trim(),
          descriptions: [{ _id: descriptionId, description: details.description.trim() }],
          taggedUser: details.storyTag.trim(),
          taggedLink: details.storyLink.trim(),
          additionalBrief: details.additionalBrief.trim(),
        },
      });
    });

    const replacedIds = new Set(
      targets.map(getSelectedContentRef).filter(Boolean)
        .map((item) => String(item?.campaignContentItemId)),
    );
    const retainedIds = new Set(
      accounts.filter((account) => !targetKeys.has(draftAccountKey(account)))
        .map(getSelectedContentRef).filter(Boolean)
        .map((item) => String(item?.campaignContentItemId)),
    );
    setDraft((current) => current ? {
      ...current,
      campaignContent: [
        ...(current.campaignContent ?? []).filter((item) =>
          !replacedIds.has(String(item._id)) || retainedIds.has(String(item._id)),
        ),
        ...Array.from(contentByAccount.values(), ({ content }) => content),
      ],
    } : current);
    setAccounts((current) => current.map((account) => {
      const content = contentByAccount.get(draftAccountKey(account));
      return content ? {
        ...account,
        selectedContent: content.selectedContent,
        selectedCampaignContentItem: content.selectedContent,
      } : account;
    }));
    closeDetails();
  };

  const applyAllOverwriteCount = useMemo(() => {
    if (!draft || !editingAccount || !applyToAll) return 0;
    const editingKey = draftAccountKey(editingAccount);
    return selectedAccounts.filter((account) =>
      draftAccountKey(account) !== editingKey &&
      getDraftContentStatus(getContentForDraftAccount(draft, account)) !== "empty",
    ).length;
  }, [applyToAll, draft, editingAccount, selectedAccounts]);

  const handleSaveDetails = () => {
    if (applyAllOverwriteCount > 0 && !confirmApplyToAll) {
      setConfirmApplyToAll(true);
      return;
    }
    saveDetails();
  };

  const removeAccount = (key: string) => {
    const index = accounts.findIndex((account) => draftAccountKey(account) === key);
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
    setAccounts((current) => current.filter(
      (account) => draftAccountKey(account) !== key,
    ));
    if (removedContentId && !contentStillUsed) {
      setDraft((current) => current
        ? {
          ...current,
          campaignContent: (current.campaignContent ?? []).filter(
            (item) => String(item._id) !== removedContentId,
          ),
        }
        : current);
    }
    setActionKey(null);
    if (editingKey === key) closeDetails();

    toast(({ closeToast }) => (
      <div className={styles.undoToast}>
        <span>{removedAccount.username} removed from the draft.</span>
        <button
          type="button"
          onClick={() => {
            setAccounts((current) => {
              if (current.some((account) => draftAccountKey(account) === key)) return current;
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
                  campaignContent: [...(current.campaignContent ?? []), removedContent],
                }
                : current);
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
  };

  const continueTo = async (action: () => void, requireSelection = true) => {
    if (requireSelection && !selectedAccounts.length) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (await persist()) action();
  };

  if (query.isLoading) return <div className={styles.state}>Loading campaign draft...</div>;
  if (query.isError || !draft) {
    return (
      <div className={`${styles.state} ${styles.errorState}`}>
        <span>Campaign draft is unavailable.</span>
        <button type="button" onClick={() => void query.refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <section className={styles.card} aria-label={`Campaign draft ${draft.campaignName}`}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Campaign draft</span>
          <h3>{draft.campaignName}</h3>
        </div>
        <span className={`${styles.saveStatus} ${["error", "conflict"].includes(saveStatus) ? styles.saveError : ""}`}>
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "conflict" ? "Changed elsewhere"
              : saveStatus === "error" ? "Not saved" : "Saved"}
        </span>
      </header>

      <div className={styles.summary}>
        <div><strong>{formatCompactNumber(totalFollowers)}</strong><span>Total reach</span></div>
        <div><strong>{formatDraftCurrency(totalPrice)}</strong><span>Total budget</span></div>
        <div><strong>{selectedAccounts.length}</strong><span>Posts</span></div>
        <div><strong>{platforms}</strong><span>Platform</span></div>
      </div>

      <div className={styles.tableHeader}>
        <div>
          <h4>Campaign pages</h4>
          <p>{selectedAccounts.length} of {accounts.length} included · live prices &amp; reach</p>
        </div>
        <button type="button" onClick={() => setAddPagesOpen(true)}>+ Add pages</button>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th aria-label="Include" /><th>Network</th><th>Followers</th><th>Price</th><th>Required date</th><th>Actions</th></tr></thead>
          <tbody>
            {accounts.map((account) => {
              const key = draftAccountKey(account);
              const isAvailable = account.isAvailable !== false;
              const selected = isAvailable && account.isSelected !== false;
              const readiness = getDraftContentReadiness(getContentForDraftAccount(draft, account));
              const status = readiness.status;
              return (
                <tr key={key} className={selected ? "" : styles.disabledRow}>
                  <td data-label="Include"><input type="checkbox" checked={selected} disabled={!isAvailable} onChange={(event) => updateAccount(key, { isSelected: event.target.checked })} aria-label={`Include ${account.username}`} /></td>
                  <td data-label="Network">
                    <div className={styles.network}>
                      {account.logoUrl ? <img src={account.logoUrl} alt="" /> : <span className={styles.avatarFallback} />}
                      <div>
                        <strong>{account.username}</strong>
                        <span>{normalizeDraftPlatform(account.socialMedia)}</span>
                        <span className={`${styles.contentStatus} ${styles[`contentStatus_${isAvailable ? status : "incomplete"}`]}`}>
                          {isAvailable ? readiness.label : "Page unavailable"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Followers">{Number(account.followers ?? 0).toLocaleString("en")}</td>
                  <td data-label="Price">{formatDraftCurrency(Number(account.price ?? 0))}</td>
                  <td data-label="Required date">
                    <CampaignRequiredDateControl
                      className={styles.dateField}
                      value={account.dateRequest}
                      disabled={!selected}
                      label={account.username}
                      onChange={(dateRequest) => updateAccount(key, { dateRequest })}
                    />
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.editButton} onClick={() => openDetails(account)} disabled={!selected}>Edit details</button>
                      <div className={styles.moreWrap}>
                        <button type="button" className={styles.moreButton} onClick={() => setActionKey((current) => current === key ? null : key)} aria-label={`More actions for ${account.username}`} aria-expanded={actionKey === key}>...</button>
                        {actionKey === key && <button type="button" className={styles.removeButton} onClick={() => removeAccount(key)}>Remove from draft</button>}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPrice > 1000 && (
        <label className={styles.noContent}>
          <input type="checkbox" checked={noContentAvailable} onChange={(event) => setNoContentAvailable(event.target.checked)} />
          <span><strong>Need creative support?</strong><small>Ask our team to prepare campaign-ready meme content.</small></span>
        </label>
      )}

      {!canCheckout && selectedAccounts.length > 0 && (
        <div className={styles.nextStep}>
          <div>
            <strong>{noContentAvailable ? "Creative support requested" : "Next: add campaign content"}</strong>
            <span>
              {noContentAvailable
                ? "The request is saved with this draft. Checkout stays locked until campaign content is ready."
                : "Send the promo link and post text in chat. Tags, story link and an additional brief are optional."}
            </span>
          </div>
          <div className={styles.nextStepActions}>
            <button
              type="button"
              onClick={() => {
                if (noContentAvailable) setNoContentAvailable(false);
                onPrompt("Promote [paste your content link] with the post text: [write the caption]");
              }}
            >{noContentAvailable ? "Add my own content in chat" : "Continue in chat"}</button>
            <button
              type="button"
              className={styles.nextStepPrimary}
              disabled={saveStatus === "saving"}
              onClick={() => {
                if (noContentAvailable) setNoContentAvailable(false);
                const nextAccount = selectedAccounts.find((account) =>
                  getDraftContentStatus(getContentForDraftAccount(draft, account)) !== "ready",
                ) ?? selectedAccounts[0];
                if (nextAccount) openDetails(nextAccount);
              }}
            >{noContentAvailable ? "Add my own content" : "Add content"}</button>
          </div>
        </div>
      )}

      {saveStatus === "error" && <div className={styles.saveFailure}>Changes could not be saved. <button type="button" onClick={() => void persist()}>Retry</button></div>}
      {saveStatus === "conflict" && <div className={styles.saveFailure}>This draft changed in another place. <button type="button" onClick={() => void query.refetch()}>Reload latest</button></div>}
      {!selectedAccounts.length && <div className={styles.warning}>Select at least one page to continue.</div>}

      {canCheckout && (
        <footer className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={!selectedAccounts.length} onClick={() => void continueTo(() => navigate(`/client/create-campaign?draftId=${draftId}&source=ai`))}>Customize</button>
          <button
            type="button"
            className={styles.primary}
            disabled={!selectedAccounts.length || saveStatus === "saving"}
            onClick={() => void continueTo(() => onProceedToPayment(draftId))}
          >
            Proceed to checkout
          </button>
        </footer>
      )}

      {editingAccount && (
        <div className={styles.drawerOverlay} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
          <section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="inline-campaign-content-title">
            <header className={styles.drawerHeader}>
              <div><span>{normalizeDraftPlatform(editingAccount.socialMedia)}</span><h2 id="inline-campaign-content-title">Content for {editingAccount.username}</h2></div>
              <button type="button" onClick={closeDetails} aria-label="Close content details">×</button>
            </header>
            <div className={styles.drawerBody}>
              <p className={styles.drawerIntro}>Add account-specific publishing details. A content URL and post description mark this page as ready.</p>
              <label className={styles.field}><span>Content URL</span><input type="url" value={details.contentUrl} onChange={(event) => updateDetails("contentUrl", event.target.value)} placeholder="https://..." maxLength={2000} aria-invalid={Boolean(detailsErrors.contentUrl)} />{detailsErrors.contentUrl && <small>{detailsErrors.contentUrl}</small>}</label>
              <label className={styles.field}><span>Post description</span><textarea value={details.description} onChange={(event) => updateDetails("description", event.target.value)} placeholder="What should be published with the post?" rows={5} maxLength={2000} /></label>
              <div className={styles.fieldRow}>
                <label className={styles.field}><span>Story tag</span><input value={details.storyTag} onChange={(event) => updateDetails("storyTag", event.target.value)} placeholder="@artist" maxLength={100} /></label>
                <label className={styles.field}><span>Story link</span><input type="url" value={details.storyLink} onChange={(event) => updateDetails("storyLink", event.target.value)} placeholder="https://..." maxLength={2000} aria-invalid={Boolean(detailsErrors.storyLink)} />{detailsErrors.storyLink && <small>{detailsErrors.storyLink}</small>}</label>
              </div>
              <label className={styles.field}><span>Additional brief</span><textarea value={details.additionalBrief} onChange={(event) => updateDetails("additionalBrief", event.target.value)} placeholder="Timing, tone, visual direction, or other instructions" rows={4} maxLength={2000} /></label>
              {selectedAccounts.length > 1 && <label className={styles.applyAll}><input type="checkbox" checked={applyToAll} onChange={(event) => { setApplyToAll(event.target.checked); setConfirmApplyToAll(false); }} /><span><strong>Apply these details to all selected pages</strong><small>{applyAllOverwriteCount > 0 ? `This will replace existing details for ${applyAllOverwriteCount} other ${applyAllOverwriteCount === 1 ? "page" : "pages"}.` : "Only selected pages will receive a separate editable copy."}</small></span></label>}
              {confirmApplyToAll && applyAllOverwriteCount > 0 && <div className={styles.overwriteWarning} role="alert"><strong>Existing content will be replaced</strong><span>Review the change, then confirm replacement for {applyAllOverwriteCount} {applyAllOverwriteCount === 1 ? "page" : "pages"}.</span></div>}
            </div>
            <footer className={styles.drawerFooter}><span>Campaign content details</span><div><button type="button" className={styles.secondary} onClick={closeDetails}>Cancel</button><button type="button" className={styles.primary} onClick={handleSaveDetails}>{confirmApplyToAll && applyAllOverwriteCount > 0 ? `Replace details for ${applyAllOverwriteCount} ${applyAllOverwriteCount === 1 ? "page" : "pages"}` : applyAllOverwriteCount > 0 ? "Review overwrite" : "Save details"}</button></div></footer>
          </section>
        </div>
      )}
      <CampaignAddPagesDrawer
        open={addPagesOpen}
        existingAccountIds={existingAccountIds}
        onClose={closeAddPages}
        onAdd={addPages}
        onAdvancedSearch={() => {
          closeAddPages();
          void continueTo(
            () => navigate(`/client/create-campaign?draftId=${draftId}&previewTarget=accounts&source=ai&mode=ai-add-pages&returnTo=${encodeURIComponent("/ai-chat")}`),
            false,
          );
        }}
      />
    </section>
  );
};
