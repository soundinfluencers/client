import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  getContentForDraftAccount,
  getDraftContentStatus,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";
import type { CampaignSetupSurface } from "./campaign-setup.model.ts";

export type CampaignSectionFingerprints = Record<CampaignSetupSurface, string>;

const accountKey = (account: { socialAccountId?: string; username?: string }) =>
  String(account.socialAccountId ?? account.username ?? "");

// A per-section signature of the draft. The draft revision cannot be used for this:
// it moves on every edit, so a change in one section would light up all of them.
export const campaignSectionFingerprints = (
  draft: CampaignDraftDto,
): CampaignSectionFingerprints => {
  const accounts = [...(draft.addedAccounts ?? [])].sort((left, right) =>
    accountKey(left).localeCompare(accountKey(right)),
  );
  const included = accounts.filter(
    (account) => account.isAvailable !== false && account.isSelected !== false,
  );

  return {
    pages: accounts
      .map((account) => `${accountKey(account)}:${account.isSelected !== false ? 1 : 0}`)
      .join("|"),
    content: included
      .map(
        (account) =>
          `${accountKey(account)}:${getDraftContentStatus(
            getContentForDraftAccount(draft, account),
          )}`,
      )
      .join("|"),
    schedule: included
      .map((account) => `${accountKey(account)}:${account.dateRequest ?? ""}`)
      .join("|"),
    promo: draft.promoCreative?.id ?? "",
  };
};

const seenKey = (draftId: string) => `ai-chat:sections-seen:${draftId}`;

export const readSeenSections = (draftId: string): Partial<CampaignSectionFingerprints> => {
  try {
    const raw = sessionStorage.getItem(seenKey(draftId));
    return raw ? (JSON.parse(raw) as Partial<CampaignSectionFingerprints>) : {};
  } catch {
    return {};
  }
};

export const writeSeenSections = (
  draftId: string,
  seen: Partial<CampaignSectionFingerprints>,
): void => {
  try {
    sessionStorage.setItem(seenKey(draftId), JSON.stringify(seen));
  } catch {
    /* private mode / quota — the dots simply stop persisting */
  }
};
