import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import {
  CAMPAIGN_SETUP_CHECKPOINTS,
  getCampaignSetupProgress,
  type CampaignSetupAction,
  type CampaignSetupCheckpoint,
  type CampaignSetupSurface,
} from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";
import {
  campaignSectionFingerprints,
  readSeenSections,
  writeSeenSections,
  type CampaignSectionFingerprints,
} from "@/entities/client-side/campaign-setup/model/campaign-section-changes.ts";

import styles from "./campaign-steps-rail.module.scss";

interface Props {
  draftId: string;
  activeSurface: CampaignSetupSurface | null;
  onSelect: (action: CampaignSetupAction) => void;
}

const STATUS_HINT: Record<CampaignSetupCheckpoint["status"], string> = {
  complete: "done",
  current: "next up",
  pending: "not started yet",
};

// Steps are orientation, not a score: no numbering, no counter, no progress bar.
// A step is a way into the surface where that part of the campaign is edited.
export const CampaignStepsRail = ({ draftId, activeSurface, onSelect }: Props) => {
  const query = useQuery({
    queryKey: ["campaign-draft", draftId],
    queryFn: () => getCampaignDraft(draftId),
    retry: false,
  });

  // Without the draft the rail still navigates — it just cannot say what is done.
  const checkpoints = useMemo<CampaignSetupCheckpoint[]>(
    () =>
      query.data
        ? getCampaignSetupProgress(query.data).checkpoints
        : CAMPAIGN_SETUP_CHECKPOINTS.map((checkpoint) => ({
            id: checkpoint.id,
            label: checkpoint.label,
            shortLabel: checkpoint.shortLabel,
            description: checkpoint.description,
            action: checkpoint.action,
            status: "pending" as const,
          })),
    [query.data],
  );

  const openIndex = activeSurface
    ? checkpoints.findIndex(
        (checkpoint) =>
          checkpoint.action.kind === "surface" &&
          checkpoint.action.surface === activeSurface,
      )
    : -1;

  // Background updates never switch the screen. They only mark the section that moved,
  // and the mark clears for whatever the user is looking at.
  const [seen, setSeen] = useState<Partial<CampaignSectionFingerprints>>(() =>
    readSeenSections(draftId),
  );
  const fingerprints = useMemo(
    () => (query.data ? campaignSectionFingerprints(query.data) : null),
    [query.data],
  );

  useEffect(() => setSeen(readSeenSections(draftId)), [draftId]);

  useEffect(() => {
    if (!fingerprints) return;
    setSeen((current) => {
      // Sections the user has never opened start as seen: a fresh draft is not "changed".
      const next: Partial<CampaignSectionFingerprints> = { ...current };
      let touched = false;
      (Object.keys(fingerprints) as CampaignSetupSurface[]).forEach((section) => {
        const isOpen = section === activeSurface;
        const unknown = next[section] === undefined;
        if ((isOpen || unknown) && next[section] !== fingerprints[section]) {
          next[section] = fingerprints[section];
          touched = true;
        }
      });
      if (touched) writeSeenSections(draftId, next);
      return touched ? next : current;
    });
  }, [activeSurface, draftId, fingerprints]);

  const hasChanged = (surface: CampaignSetupSurface) =>
    Boolean(
      fingerprints &&
        surface !== activeSurface &&
        seen[surface] !== undefined &&
        seen[surface] !== fingerprints[surface],
    );

  return (
    <nav className={styles.rail} aria-label="Campaign sections">
      <span className={styles.name} title={query.data?.campaignName || undefined}>
        {query.data?.campaignName || "Campaign draft"}
      </span>

      <ul className={styles.steps}>
        {checkpoints.map((checkpoint, index) => {
          // Several sections are edited in the same surface; only the one that owns it
          // reads as open, otherwise half the rail would light up at once.
          const isOpen = index === openIndex;
          const showStatus = Boolean(query.data);
          const changed =
            checkpoint.action.kind === "surface" && hasChanged(checkpoint.action.surface);
          return (
            <li key={checkpoint.id}>
              <button
                type="button"
                className={[
                  styles.step,
                  styles[`step_${checkpoint.status}`],
                  isOpen ? styles.stepOpen : "",
                  changed ? styles.stepChanged : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isOpen ? "true" : undefined}
                aria-label={[
                  checkpoint.label,
                  showStatus ? `— ${STATUS_HINT[checkpoint.status]}` : "",
                  changed ? "— updated" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={changed ? `${checkpoint.description} · updated` : checkpoint.description}
                onClick={() => onSelect(checkpoint.action)}
              >
                <i className={styles.dot} aria-hidden="true" />
                {checkpoint.shortLabel}
                {changed && <i className={styles.changeMark} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
