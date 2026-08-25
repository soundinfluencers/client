import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import { ObjectId } from "bson";
import {
  getDraftSocialMediaGroup,
  getSelectedContentRef,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";

export const hydrateCampaignBuilderFromDraft = (draft: CampaignDraftDto) => {
  const store = useCampaignBuilderStore.getState();
  const selectedAccounts =
    draft.addedAccounts?.filter(
      (account) =>
        account.isAvailable !== false && account.isSelected !== false,
    ) ?? [];

  // Creative support is a real checkout route, not just a UI override. The paid campaign
  // schema still requires a content assignment for every page, so missing assignments receive
  // an explicit team-support placeholder. Admins also receive `noContentAvailable` from the
  // origin draft and can replace these placeholders with the finished assets.
  const campaignContent = [...(draft.campaignContent ?? [])];
  const supportAssignments = new Map<
    string,
    { campaignContentItemId: string; descriptionId: string }
  >();
  if (draft.noContentAvailable) {
    for (const account of selectedAccounts) {
      const existing = getSelectedContentRef(account);
      const existingContent =
        existing &&
        campaignContent.some(
          (item) => String(item._id) === String(existing.campaignContentItemId),
        );
      if (existing && existingContent) continue;

      const contentId = new ObjectId().toHexString();
      const descriptionId = new ObjectId().toHexString();
      campaignContent.push({
        _id: contentId,
        socialMedia: account.socialMedia,
        socialMediaGroup: getDraftSocialMediaGroup(account.socialMedia),
        mainLink: "",
        descriptions: [{ _id: descriptionId, description: "" }],
        profileType: account.profileType,
        taggedUser: "",
        taggedLink: "",
        additionalBrief:
          "Creative support requested — SoundInfluencers will prepare campaign-ready content.",
        accountId: account.socialAccountId,
      });
      supportAssignments.set(String(account.socialAccountId), {
        campaignContentItemId: contentId,
        descriptionId,
      });
    }
  }

  store.actions.hydrateFromDraft({
    draftId: String(draft._id),
    draftStep: draft.step,
    draftRevision: Number(draft.revision ?? 0),

    campaignName: draft.campaignName ?? "",

    totalPrice: Number(draft.totalPrice ?? 0),

    selectedOfferId: null,
    selectedOfferAccountIds: [],

    selectedPromoCardIds: selectedAccounts.map((acc) =>
      String(acc.socialAccountId),
    ),

    selectedAccounts: selectedAccounts.map((acc) => ({
      accountId: String(acc.socialAccountId),

      influencerId: String(acc.influencerId),

      username: acc.username ?? "",

      socialMedia: acc.socialMedia,

      followers: Number(acc.followers ?? 0),

      profileType: acc.profileType,

      price: Number(acc.price ?? 0),

      logoUrl: acc.logoUrl ?? "",

      source: "manual" as const,

      // The backend GET returns the assignment as `selectedContent`; older callers
      // expected `selectedCampaignContentItem`. Accept both so the content-to-account
      // assignment survives draft resume (it silently dropped before).
      selectedCampaignContentItem:
        supportAssignments.get(String(acc.socialAccountId)) ??
        acc.selectedCampaignContentItem ??
        (acc as any).selectedContent ??
        null,

      dateRequest: acc.dateRequest ?? "ASAP",
    })),

    campaignContent,

    postContentDraft: null,

    blocksDraft: null,
  });
};
