import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  getContentForDraftAccount,
  getDraftContentStatus,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";

export type CampaignSetupCheckpointId =
  | "brief"
  | "influencers"
  | "promo"
  | "publishing"
  | "schedule";

export type CampaignSetupCheckpointStatus = "complete" | "current" | "pending";

// A step either opens a working surface next to the conversation, or it has no
// editor of its own and hands the job back to the agent as a chat prompt.
export type CampaignSetupSurface = "pages" | "content" | "schedule" | "promo";

export type CampaignSetupAction =
  | { kind: "prompt"; label: string; prompt: string }
  | { kind: "surface"; label: string; surface: CampaignSetupSurface };

export type CampaignSetupCheckpoint = {
  id: CampaignSetupCheckpointId;
  label: string;
  shortLabel: string;
  description: string;
  action: CampaignSetupAction;
  status: CampaignSetupCheckpointStatus;
};

type CheckpointDefinition = Omit<CampaignSetupCheckpoint, "status"> & {
  isComplete: (draft: CampaignDraftDto) => boolean;
};

const selectedAccounts = (draft: CampaignDraftDto) =>
  (draft.addedAccounts ?? []).filter(
    (account) => account.isAvailable !== false && account.isSelected !== false,
  );

// The sequence and completion rules live in one registry. New campaign steps can
// be inserted here without changing the rail, the workspace, or the progress calculation.
export const CAMPAIGN_SETUP_CHECKPOINTS: readonly CheckpointDefinition[] = [
  {
    id: "brief",
    label: "Campaign brief",
    shortLabel: "Brief",
    description: "Name and direction are clear",
    action: {
      kind: "prompt",
      label: "Complete brief",
      prompt: "Help me complete the campaign brief and campaign name.",
    },
    isComplete: (draft) => Boolean(draft.campaignName?.trim()),
  },
  {
    id: "influencers",
    label: "Influencer selection",
    shortLabel: "Pages",
    description: "At least one page is included",
    action: { kind: "surface", label: "Review pages", surface: "pages" },
    isComplete: (draft) => selectedAccounts(draft).length > 0,
  },
  {
    id: "promo",
    label: "Promo creative",
    shortLabel: "Promo",
    description: "Upload, transform a photo, or use a template style",
    action: { kind: "surface", label: "Create promo", surface: "promo" },
    isComplete: (draft) => Boolean(draft.promoCreative?.assetUrl),
  },
  {
    id: "publishing",
    label: "Publishing details",
    shortLabel: "Content",
    // Content is edited per page, inside the pages table.
    description: "Content link and description for every page",
    action: { kind: "surface", label: "Add content", surface: "content" },
    isComplete: (draft) => {
      const accounts = selectedAccounts(draft);
      return accounts.length > 0 && accounts.every(
        (account) => getDraftContentStatus(getContentForDraftAccount(draft, account)) === "ready",
      );
    },
  },
  {
    id: "schedule",
    label: "Schedule",
    shortLabel: "Dates",
    description: "A publishing date is set for every page",
    action: { kind: "surface", label: "Review dates", surface: "schedule" },
    isComplete: (draft) => {
      const accounts = selectedAccounts(draft);
      return accounts.length > 0 && accounts.every((account) => Boolean(account.dateRequest?.trim()));
    },
  },
] as const;

export const getCampaignSetupProgress = (draft: CampaignDraftDto) => {
  const completion = CAMPAIGN_SETUP_CHECKPOINTS.map((checkpoint) =>
    checkpoint.isComplete(draft),
  );
  const currentIndex = completion.findIndex((complete) => !complete);
  const checkpoints: CampaignSetupCheckpoint[] = CAMPAIGN_SETUP_CHECKPOINTS.map(
    (checkpoint, index) => ({
      id: checkpoint.id,
      label: checkpoint.label,
      shortLabel: checkpoint.shortLabel,
      description: checkpoint.description,
      action: checkpoint.action,
      status: completion[index]
        ? "complete"
        : index === currentIndex
          ? "current"
          : "pending",
    }),
  );

  return {
    checkpoints,
    completed: completion.filter(Boolean).length,
    total: completion.length,
    isComplete: completion.every(Boolean),
  };
};
