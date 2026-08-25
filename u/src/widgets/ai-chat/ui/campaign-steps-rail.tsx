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
  dialogueUnread: boolean;
  onSelect: (action: CampaignSetupAction) => void;
  // The campaign-level action: everything is filled in, take the client to checkout.
  onProceed: (draftId: string) => void;
}

const STATUS_HINT: Record<CampaignSetupCheckpoint["status"], string> = {
  complete: "done",
  current: "next up",
  pending: "not started yet",
  optional: "optional — not added",
};

// Steps are orientation, not a score: no numbering, no counter, no progress bar.
// A step is a way into the surface where that part of the campaign is edited.
export const CampaignStepsRail = ({
  draftId,
  activeSurface,
  dialogueUnread,
  onSelect,
  onProceed,
}: Props) => {
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
            optional: checkpoint.optional,
            status: checkpoint.optional
              ? ("optional" as const)
              : ("pending" as const),
            remaining: checkpoint.description,
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
  const [nudgedId, setNudgedId] = useState<string | null>(null);
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
      (Object.keys(fingerprints) as CampaignSetupSurface[]).forEach(
        (section) => {
          const isOpen = section === activeSurface;
          const unknown = next[section] === undefined;
          if ((isOpen || unknown) && next[section] !== fingerprints[section]) {
            next[section] = fingerprints[section];
            touched = true;
          }
        },
      );
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

  // Clicking the campaign action while something is missing is not an error: it takes
  // the client to the first unfinished section and says so, instead of refusing.
  const firstIncomplete = checkpoints.find(
    (checkpoint) => !checkpoint.optional && checkpoint.status !== "complete",
  );
  const isReady = Boolean(query.data) && !firstIncomplete;
  const remaining = checkpoints.filter(
    (checkpoint) => !checkpoint.optional && checkpoint.status !== "complete",
  );

  const handleProceed = () => {
    if (isReady) {
      onProceed(draftId);
      return;
    }
    if (!firstIncomplete) return;
    setNudgedId(firstIncomplete.id);
    window.setTimeout(() => setNudgedId(null), 1600);
    onSelect(firstIncomplete.action);
  };

  return (
    <nav className={styles.rail} aria-label="Campaign sections">
      <span
        className={styles.name}
        title={query.data?.campaignName || undefined}
      >
        {query.data?.campaignName || "Campaign draft"}
      </span>

      <ul className={styles.steps}>
        <li className={styles.beforeDivider}>
          <button
            type="button"
            className={[
              styles.step,
              styles.stepChat,
              activeSurface === null ? styles.stepOpen : "",
              dialogueUnread ? styles.stepChanged : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={activeSurface === null ? "true" : undefined}
            aria-label={`Dialogue with the assistant${dialogueUnread ? " — new reply" : ""}`}
            title={
              dialogueUnread
                ? "The assistant has a new reply"
                : "Open the campaign dialogue"
            }
            onClick={() => onSelect({ kind: "chat", label: "Open Dialogue" })}
          >
            <i className={styles.chatGlyph} aria-hidden="true" />
            Dialogue
            {dialogueUnread && (
              <i className={styles.changeMark} aria-hidden="true" />
            )}
          </button>
        </li>
        {checkpoints.map((checkpoint, index) => {
          // Several sections are edited in the same surface; only the one that owns it
          // reads as open, otherwise half the rail would light up at once.
          const isOpen = index === openIndex;
          const showStatus = Boolean(query.data);
          const isChat = checkpoint.action.kind === "chat";
          const changed =
            checkpoint.action.kind === "surface" &&
            hasChanged(checkpoint.action.surface);
          // Forward sections used to wait for their prerequisites. Unlocked on purpose:
          // every section is reachable in any order, the status dot still says what is done.
          // const locked = checkpoint.status === "pending" ||
          //   (checkpoint.status === "optional" && !isReady);
          const locked = false;
          // The conversation sits apart from the surfaces, so it is visible that this
          // part is settled by talking rather than by editing a table.
          return (
            <li key={checkpoint.id}>
              <button
                type="button"
                className={[
                  styles.step,
                  // A conversation is not a checklist item: it has no done/undone state.
                  isChat
                    ? styles.stepChat
                    : styles[`step_${checkpoint.status}`],
                  isOpen ? styles.stepOpen : "",
                  changed ? styles.stepChanged : "",
                  nudgedId === checkpoint.id ? styles.stepNudged : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isOpen ? "true" : undefined}
                aria-label={[
                  checkpoint.label,
                  isChat ? "— talk to the assistant" : "",
                  !isChat && showStatus
                    ? `— ${STATUS_HINT[checkpoint.status]}`
                    : "",
                  changed ? "— updated" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={
                  locked
                    ? "Complete the current campaign section first"
                    : isChat
                      ? `${checkpoint.description} · ask the assistant in the chat`
                      : changed
                        ? `${checkpoint.description} · updated`
                        : checkpoint.description
                }
                disabled={locked}
                onClick={() => onSelect(checkpoint.action)}
              >
                {isChat ? (
                  <i className={styles.chatGlyph} aria-hidden="true" />
                ) : (
                  <i className={styles.dot} aria-hidden="true">
                    {checkpoint.status === "complete" ? "✓" : ""}
                  </i>
                )}
                {checkpoint.shortLabel}
                {checkpoint.optional && (
                  <span className={styles.optionalBadge}>Optional</span>
                )}
                {changed && (
                  <i className={styles.changeMark} aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.proceedWrap}>
        <button
          type="button"
          className={`${styles.proceed} ${isReady ? styles.proceedReady : ""}`}
          onClick={handleProceed}
          aria-describedby={
            !isReady && remaining.length ? "campaign-remaining" : undefined
          }
        >
          {isReady ? "Review & pay" : `What's left? (${remaining.length})`}
        </button>
        {!isReady && remaining.length > 0 && (
          <div
            id="campaign-remaining"
            className={styles.remainingPopover}
            role="tooltip"
          >
            <strong>Still needed</strong>
            <ul>
              {remaining.map((checkpoint) => (
                <li key={checkpoint.id}>
                  <b>{checkpoint.shortLabel}</b>
                  <span>{checkpoint.remaining ?? checkpoint.description}</span>
                </li>
              ))}
            </ul>
            <small>Click to open the first unfinished section.</small>
          </div>
        )}
      </div>
    </nav>
  );
};
