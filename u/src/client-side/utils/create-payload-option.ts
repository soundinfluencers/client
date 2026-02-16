import type { CampaignContentItem } from "@/types/store/index.types";

type ProposalUpdatePayload = {
  optionIndex: number;
  socialMedia: string; // "instagram" | "multipromo" | ...
  addedAccounts: Array<{
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    publicPrice?: number;
    followers?: number;
    selectedContent?: { campaignContentItemId: string; descriptionId: string };
    dateRequest?: string;
  }>;
  campaignContent: CampaignContentItem[];
};

const norm = (v: any) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

function pickDefaultSelectedContent(campaignContent: any[]) {
  const first = campaignContent?.[0];
  const firstDesc = first?.descriptions?.[0];
  if (!first?._id || !firstDesc?._id) return undefined;

  return {
    campaignContentItemId: String(first._id),
    descriptionId: String(firstDesc._id),
  };
}

export function buildProposalUpdatePayload(args: {
  optionIndex: number;
  optionAccounts: any[]; // local/server accounts из стора
  campaignContent: any[]; // campaign.selectedOption.campaignContent
}): ProposalUpdatePayload {
  const { optionIndex, optionAccounts, campaignContent } = args;

  const socials = Array.from(
    new Set(optionAccounts.map((a) => norm(a.socialMedia)).filter(Boolean)),
  );

  const socialMedia = socials.length > 1 ? "multipromo" : (socials[0] ?? "");

  const defaultSelected = pickDefaultSelectedContent(campaignContent);

  const addedAccounts = optionAccounts.map((a) => ({
    socialAccountId: String(a.socialAccountId ?? a.accountId ?? ""),
    influencerId: String(a.influencerId ?? ""),
    socialMedia: norm(a.socialMedia),
    username: String(a.username ?? ""),
    publicPrice: Number(a.publicPrice ?? a.price ?? 0),
    followers: Number(a.followers ?? 0),
    dateRequest: a.dateRequest ?? "ASAP",
    selectedContent: a.selectedContent ?? defaultSelected, // ✅ для новых — дефолт
  }));

  return { optionIndex, socialMedia, addedAccounts, campaignContent };
}
