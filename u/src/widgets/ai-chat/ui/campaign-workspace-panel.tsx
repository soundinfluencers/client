import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCampaignDraft,
  saveCampaignDraftPromo,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import type { PromoCreativeDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import type { CampaignSetupSurface } from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";
import { flushCampaignDraftSaves } from "../model/campaign-draft-save-coordinator.ts";
import { AiCampaignDraftCard } from "./ai-campaign-draft-card.tsx";
import { PromoStudio } from "./promo-studio.tsx";

import styles from "./campaign-workspace-panel.module.scss";

interface Props {
  draftId: string;
  surface: CampaignSetupSurface;
  onClose: () => void;
  onPrompt: (prompt: string) => void;
  onProceedToPayment: (draftId: string) => void;
  // Leaves a receipt in the transcript for work the agent did not do itself.
  onNote: (text: string, section: CampaignSetupSurface) => void;
}

const SURFACE_TITLES: Record<CampaignSetupSurface, string> = {
  pages: "Influencer selection",
  content: "Publishing content",
  schedule: "Publishing dates",
  promo: "Promo creative",
};

const PAGE_FOCUS_MODES = {
  pages: "selection",
  content: "content",
  schedule: "schedule",
} as const;

export const CampaignWorkspacePanel = ({
  draftId,
  surface,
  onClose,
  onPrompt,
  onProceedToPayment,
  onNote,
}: Props) => {
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  // Only the promo editor needs the draft up here; the pages table loads its own.
  const query = useQuery({
    queryKey: ["campaign-draft", draftId],
    queryFn: () => getCampaignDraft(draftId),
    retry: false,
    enabled: surface === "promo",
  });

  useEffect(() => {
    setSaveError(null);
    containerRef.current?.focus();
  }, [surface, draftId]);

  const savePromo = async (promoCreative: PromoCreativeDto) => {
    setSaveError(null);
    const flushed = await flushCampaignDraftSaves();
    if (!flushed) throw new Error("Campaign changes are not saved");
    const latest = await query.refetch();
    if (!latest.data) throw new Error("Campaign draft is unavailable");
    const result = await saveCampaignDraftPromo(
      draftId,
      Number(latest.data.revision ?? 0),
      promoCreative,
    );
    queryClient.setQueryData(
      ["campaign-draft", draftId],
      { ...latest.data, revision: result.revision, promoCreative },
    );
  };

  // Escape closes the workspace, but never steals the key from a nested dialog
  // (the per-page content form holds unsaved input).
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    if ((event.target as HTMLElement).closest('[role="dialog"]')) return;
    event.stopPropagation();
    onClose();
  };

  return (
    <section
      ref={containerRef}
      className={styles.surface}
      role="region"
      aria-label={SURFACE_TITLES[surface]}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <h2>{SURFACE_TITLES[surface]}</h2>
        <button type="button" onClick={onClose} aria-label="Close campaign workspace">
          ×
        </button>
      </header>

      {saveError && (
        <div className={styles.saveError} role="alert">
          {saveError}
        </div>
      )}

      <div className={styles.body}>
        {surface !== "promo" && (
          <AiCampaignDraftCard
            key={surface}
            flat
            draftId={draftId}
            focusMode={PAGE_FOCUS_MODES[surface]}
            onProceedToPayment={onProceedToPayment}
            onPrompt={onPrompt}
          />
        )}

        {surface === "promo" && query.isPending && (
          <div className={styles.state}>Loading campaign draft…</div>
        )}

        {surface === "promo" && query.isError && (
          <div className={`${styles.state} ${styles.errorState}`}>
            <span>Campaign draft is unavailable.</span>
            <button type="button" onClick={() => void query.refetch()}>
              Retry
            </button>
          </div>
        )}

        {surface === "promo" && query.data && (
          <PromoStudio
            embedded
            open
            draft={query.data}
            // Approving finishes the job, so the workspace steps aside and the
            // conversation comes back into view.
            onClose={onClose}
            onGenerated={(count) =>
              onNote(
                `${count} promo ${count === 1 ? "direction" : "directions"} created`,
                "promo",
              )
            }
            onApproved={async (promo) => {
              try {
                await savePromo(promo);
              } catch {
                setSaveError(
                  "Promo was created but could not be attached to the campaign. Retry after the connection recovers.",
                );
                throw new Error("Promo save failed");
              }
              onNote("Promo attached to the campaign", "promo");
            }}
          />
        )}
      </div>
    </section>
  );
};
