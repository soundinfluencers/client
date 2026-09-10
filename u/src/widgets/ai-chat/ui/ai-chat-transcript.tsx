import { Link } from "react-router-dom";
import type { CampaignSetupSurface } from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";
import {
  type Message,
  SECTION_LABELS,
  sanitizeReply,
  AGENT_ERROR_MESSAGES,
  NON_RETRYABLE_AGENT_ERRORS,
  getCampaignDraftId,
  withAiSource,
} from "../model/ai-chat-session.model.ts";
import styles from "./ai-chat.module.scss";

interface Props {
  messages: Message[];
  isPending: boolean;
  isPreparingSend: boolean;
  openWorkspace: (surface: CampaignSetupSurface) => void;
  handleRetry: (message: Message) => Promise<void>;
  handleOpenPayment: (draftId: string) => Promise<void>;
}

export function AiChatTranscript({
  messages,
  isPending,
  isPreparingSend,
  openWorkspace,
  handleRetry,
  handleOpenPayment,
}: Props) {
  return (
    <>
      {messages.map((msg) =>
        msg.note ? (
          <div key={msg.id} className={styles.messageGroup}>
            <button
              type="button"
              className={styles.noteChip}
              onClick={() => openWorkspace(msg.note!.section)}
            >
              <span>{msg.note.text}</span>
              <strong>Open {SECTION_LABELS[msg.note.section]} →</strong>
            </button>
          </div>
        ) : (
          <div
            key={msg.id}
            className={`${styles.messageGroup} ${msg.assistantOnly ? styles.assistantOnly : ""}`}
          >
            {!msg.assistantOnly && (
              <div className={styles.userRow}>
                <div className={styles.userBubble}>
                  {msg.userImage && (
                    <img
                      className={styles.userImage}
                      src={msg.userImage.url}
                      alt={`Attached ${msg.userImage.name}`}
                    />
                  )}
                  <span>{msg.q}</span>
                </div>
              </div>
            )}

            <div className={styles.agentRow}>
              {msg.status === "success" && (
                <div
                  className={styles.agentBubble}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeReply(msg.a),
                  }}
                />
              )}

              {msg.status === "success" && msg.media.length > 0 && (
                <div className={styles.generatedMedia}>
                  {msg.media.map((item) => (
                    <figure key={item.url} className={styles.generatedMediaCard}>
                      <img src={item.url} alt={item.alt} />
                      <figcaption>
                        <span>Saved to this campaign’s Promo</span>
                        {item.draftId && (
                          <button type="button" onClick={() => openWorkspace("promo")}>
                            Open Promo →
                          </button>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              {msg.status === "error" && (
                <div className={styles.errorBubble}>
                  <span>{AGENT_ERROR_MESSAGES[msg.errorCode ?? "UNKNOWN"]}</span>
                  {!NON_RETRYABLE_AGENT_ERRORS.has(msg.errorCode ?? "UNKNOWN") && (
                    <button
                      onClick={() => void handleRetry(msg)}
                      disabled={isPending || isPreparingSend}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {msg.status === "success" && msg.links.length > 0 && (
                <div className={styles.links}>
                  {msg.links.map((link, k) => {
                    const campaignDraftId = getCampaignDraftId(link);
                    if (campaignDraftId) {
                      const alreadyRendered = msg.links
                        .slice(0, k)
                        .some(
                          (previousLink) =>
                            getCampaignDraftId(previousLink) === campaignDraftId,
                        );
                      if (alreadyRendered) return null;
                      // The table itself lives in the workspace — the conversation
                      // only keeps a marker of where the draft changed.
                      // A transcript restored from an older session can name a
                      // section that no longer exists; pages is the safe home.
                      const section: CampaignSetupSurface =
                        link.section === "strategy"
                          ? "brief"
                          : link.section && link.section in SECTION_LABELS
                            ? (link.section as CampaignSetupSurface)
                            : "pages";
                      return (
                        <button
                          key={campaignDraftId}
                          type="button"
                          className={
                            msg.assistantOnly ? styles.inlineBriefLink : styles.draftChip
                          }
                          onClick={() => openWorkspace(section)}
                        >
                          {msg.assistantOnly ? (
                            <strong>Open {SECTION_LABELS[section]} →</strong>
                          ) : (
                            <>
                              <span>{link.summary ?? link.label}</span>
                              <strong>Open {SECTION_LABELS[section]} →</strong>
                            </>
                          )}
                        </button>
                      );
                    }

                    // Payment links open the in-chat checkout modal instead of navigating away.
                    if (link.kind === "payment" && link.draftId) {
                      return (
                        <button
                          key={k}
                          className={styles.payChip}
                          disabled={isPending || isPreparingSend}
                          onClick={() => void handleOpenPayment(link.draftId!)}
                        >
                          {link.label} →
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={k}
                        to={withAiSource(link.path)}
                        className={styles.linkChip}
                      >
                        {link.label} →
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ),
      )}
    </>
  );
}
