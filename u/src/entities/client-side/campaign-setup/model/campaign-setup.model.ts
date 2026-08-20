import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import { isDraftReadyForCheckout } from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";
import { isRequiredBriefComplete } from "./campaign-brief-readiness.ts";

export type CampaignSetupCheckpointId = "brief" | "influencers" | "publishing" | "promo";

export type CampaignSetupCheckpointStatus = "complete" | "current" | "pending" | "optional";

// A section either opens a working surface next to the conversation, or it has no
// editor of its own and hands the job back to the agent as a chat prompt.
// Publishing dates live in the pages table: they belong to the page row, not to a
// section of their own.
export type CampaignSetupSurface = "brief" | "pages" | "content" | "promo";

// 'chat' sections have no editor of their own: they are settled by talking to the
// assistant, which may also draft publishing copy from the client's campaign context.
export type CampaignSetupAction =
  { kind: "chat"; label: string } | { kind: "surface"; label: string; surface: CampaignSetupSurface };

export type CampaignSetupCheckpoint = {
  id: CampaignSetupCheckpointId;
  label: string;
  shortLabel: string;
  description: string;
  action: CampaignSetupAction;
  optional: boolean;
  status: CampaignSetupCheckpointStatus;
};

type CheckpointDefinition = Omit<CampaignSetupCheckpoint, "status"> & {
  isComplete: (draft: CampaignDraftDto) => boolean;
};

const selectedAccounts = (draft: CampaignDraftDto) =>
  (draft.addedAccounts ?? []).filter((account) => account.isAvailable !== false && account.isSelected !== false);

// The sequence and completion rules live in one registry. New campaign steps can
// be inserted here without changing the rail, the workspace, or the progress calculation.
export const CAMPAIGN_SETUP_CHECKPOINTS: readonly CheckpointDefinition[] = [
  {
    id: "brief",
    label: "Campaign brief",
    shortLabel: "Brief",
    description: "Required campaign goal, approximate budget, audience, platforms and timing",
    action: { kind: "surface", label: "Complete brief", surface: "brief" },
    optional: false,
    isComplete: (draft) => isRequiredBriefComplete(draft.brief),
  },
  {
    id: "influencers",
    label: "Pages and dates",
    shortLabel: "Pages",
    description: "Pages are chosen and every one of them has a publishing date",
    action: { kind: "surface", label: "Review pages", surface: "pages" },
    optional: false,
    // A page without a date is not a finished choice, so both live in one section.
    isComplete: (draft) => {
      const accounts = selectedAccounts(draft);
      return accounts.length > 0 && accounts.every((account) => Boolean(account.dateRequest?.trim()));
    },
  },
  {
    id: "publishing",
    label: "Publishing details",
    shortLabel: "Content",
    // Content is edited per page, inside the pages table.
    description: "Content link and description for every page",
    action: { kind: "surface", label: "Add content", surface: "content" },
    optional: false,
    // Exactly the rule checkout enforces. A looser one here would let the rail promise
    // "ready" and the payment step refuse it a click later.
    isComplete: (draft) => isDraftReadyForCheckout(draft),
  },
  {
    id: "promo",
    label: "Promo creative",
    shortLabel: "Promo",
    description: "Optional — upload a finished promo or create one with our help",
    action: {
      kind: "surface",
      label: "Explore promo options",
      surface: "promo",
    },
    optional: true,
    isComplete: (draft) => Boolean(draft.promoCreative?.assetUrl),
  },
] as const;

export const getCampaignSetupProgress = (draft: CampaignDraftDto) => {
  const completion = CAMPAIGN_SETUP_CHECKPOINTS.map((checkpoint) => checkpoint.isComplete(draft));
  const currentIndex = completion.findIndex(
    (complete, index) => !complete && !CAMPAIGN_SETUP_CHECKPOINTS[index].optional,
  );
  const checkpoints: CampaignSetupCheckpoint[] = CAMPAIGN_SETUP_CHECKPOINTS.map((checkpoint, index) => ({
    id: checkpoint.id,
    label: checkpoint.label,
    shortLabel: checkpoint.shortLabel,
    description: checkpoint.description,
    action: checkpoint.action,
    optional: checkpoint.optional,
    status: completion[index]
      ? "complete"
      : checkpoint.optional
        ? "optional"
        : index === currentIndex
          ? "current"
          : "pending",
  }));

  return {
    checkpoints,
    completed: completion.filter((complete, index) => complete && !CAMPAIGN_SETUP_CHECKPOINTS[index].optional).length,
    total: CAMPAIGN_SETUP_CHECKPOINTS.filter((checkpoint) => !checkpoint.optional).length,
    isComplete: completion.every((complete, index) => complete || CAMPAIGN_SETUP_CHECKPOINTS[index].optional),
  };
};
