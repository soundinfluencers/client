import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";

export type DropdownKey = "date" | "content" | "postDescription";
export type SortDir = "asc" | "desc" | null;

export type CampaignContentDescription = { _id: string; description: string };

export type ContentOverrides = Partial<{
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  tracklink: string;
  tracktitle: string;
}>;

export type NetworkRowResolved = CampaignAddedAccount & {
  resolvedContent?: CampaignContentItem;
  resolvedDescription?: CampaignContentDescription;
  contentOverrides?: ContentOverrides;
};

export type UpdateRowPatch = Partial<{
  dateRequest: string;
  selectedContent: { campaignContentItemId: string; descriptionId: string };
  contentOverrides: ContentOverrides;
}>;
