import type {
  RegularCampaignData,
  CampaignPageModel,
  DraftCampaignData,
} from "@/pages/client/types";
import type {
  CampaignSocialMedia,
  ProposalCampaignDto,
  ProposalOptionDto,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import type {
  CampaignDisplayCurrency,
} from "@/shared/functions/formatCurrency.ts";

export function toCampaignPageModelFromRegular(
  api: RegularCampaignData,
): CampaignPageModel {
  return {
    kind: "regular",

    campaignId: api.campaignId,
    campaignName: api.campaignName,
    socialMedia: api.socialMedia,
    canEdit: api.canEdit,
    status: api.status,
    creationDate: api.creationDate,

    price: api.price,

    addedAccounts: api.addedAccounts,
    campaignContent: api.campaignContent,

    shareLink: api.shareLink,

    totalFollowers: api.totalFollowers,
    totalImpressions: api.totalImpressions,
    totalLikes: api.totalLikes,
    totalSaves: api.totalSaves,
    totalComments: api.totalComments,
    totalShares: api.totalShares,

    cpm: api.cpm,
    isCpmAndResultHidden: api.isCpmAndResultHidden,
    isPriceHidden: api.isPriceHidden,
    hiddenColumns: api.hiddenColumns,
    displayCurrency:api.displayCurrency
  };
}
export type ProposalCampaignPageModel = {
  kind: "proposal";
  campaignId: string;
  campaignName: string;
  socialMedia: CampaignSocialMedia;
  status: "proposal";
  existingOptions: number[];
  selectedOption: ProposalOptionDto;
  price: number;
  displayCurrency: CampaignDisplayCurrency;
};

export function toCampaignPageModelFromProposal(
  api: ProposalCampaignDto,
): ProposalCampaignPageModel {
  return {
    kind: "proposal",
    campaignId: api.campaignId,
    campaignName: api.campaignName,
    socialMedia: api.socialMedia,
    status: "proposal",
    existingOptions: api.existingOptions,
    selectedOption: api.selectedOption,
    price: api.selectedOption.price,
    displayCurrency: api.selectedOption.displayCurrency,
  };
}

export function toCampaignPageModelFromDraft(
  api: DraftCampaignData,
): CampaignPageModel {
  return {
    kind: "draft",

    draftId: api._id,
    campaignName: api.campaignName,
    socialMedia: api.socialMedia,

    status: "draft",
    step: api.step,
    addedAccounts: api.addedAccounts,
    campaignContent: api.campaignContent,

    price: 0,
    creationDate: null,
    shareLink: null,

    totalFollowers: 0,
    totalImpressions: 0,
    totalLikes: 0,
    totalSaves: 0,
    totalComments: 0,
    totalShares: 0,

    cpm: 0,
    isCpmAndResultHidden: false,
    isPriceHidden: false,
    hiddenColumns: [],
  };
}

export const isProposalModel = (
  m: CampaignPageModel,
): m is Extract<CampaignPageModel, { kind: "proposal" }> =>
  m.kind === "proposal";

export const isRegularModel = (
  m: CampaignPageModel,
): m is Extract<CampaignPageModel, { kind: "regular" }> => m.kind === "regular";

export const isDraftModel = (
  m: CampaignPageModel,
): m is Extract<CampaignPageModel, { kind: "draft" }> => m.kind === "draft";
