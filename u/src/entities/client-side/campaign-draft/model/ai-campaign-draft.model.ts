import type {
  CampaignDraftDto,
  DraftAddedAccountDto,
} from "../api/campaign-draft.dto.ts";

export type CampaignContentItem = NonNullable<CampaignDraftDto["campaignContent"]>[number];
export type ContentStatus = "ready" | "incomplete" | "empty";
export type ContentReadiness = {
  status: ContentStatus;
  label: string;
};

export type DraftDetailsForm = {
  contentUrl: string;
  description: string;
  storyTag: string;
  storyLink: string;
  additionalBrief: string;
};

export type DraftDetailsErrors = Partial<Record<keyof DraftDetailsForm, string>>;

export const EMPTY_DRAFT_DETAILS: DraftDetailsForm = {
  contentUrl: "",
  description: "",
  storyTag: "",
  storyLink: "",
  additionalBrief: "",
};

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const formatDraftCurrency = (value: number) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export const draftAccountKey = (account: DraftAddedAccountDto) =>
  `${account.socialMedia}:${account.socialAccountId}`;

export const normalizeDraftPlatform = (platform: string) =>
  platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Unknown";

export const getSelectedContentRef = (account: DraftAddedAccountDto) =>
  account.selectedContent ?? account.selectedCampaignContentItem;

export const buildAiDraftPayload = (
  draft: CampaignDraftDto,
  accounts: DraftAddedAccountDto[],
  noContentAvailable: boolean,
) => ({
  draftId: draft._id,
  revision: Number(draft.revision ?? 0),
  step: draft.step,
  socialMedia: draft.socialMedia,
  campaignName: draft.campaignName,
  addedAccounts: accounts.map((account) => ({
    influencerId: account.influencerId,
    socialAccountId: account.socialAccountId,
    socialMedia: account.socialMedia,
    isSelected: account.isSelected !== false,
    dateRequest: account.dateRequest?.trim() || "ASAP",
    ...(getSelectedContentRef(account)
      ? { selectedContent: getSelectedContentRef(account) }
      : {}),
  })),
  ...(draft.campaignContent?.length
    ? {
      campaignContent: draft.campaignContent.map((item) => ({
        _id: item._id,
        socialMedia: item.socialMedia,
        socialMediaGroup: item.socialMediaGroup,
        mainLink: item.mainLink,
        descriptions: item.descriptions,
        profileType: item.profileType,
        taggedUser: item.taggedUser,
        taggedLink: item.taggedLink,
        additionalBrief: item.additionalBrief,
      })),
    }
    : {}),
  noContentAvailable:
    accounts
      .filter((account) => account.isSelected !== false)
      .reduce((sum, account) => sum + Number(account.price ?? 0), 0) > 1000
      ? noContentAvailable
      : false,
});

export const getAiDraftPayloadSignature = (
  payload: ReturnType<typeof buildAiDraftPayload>,
) => JSON.stringify({ ...payload, revision: 0 });

export const getContentForDraftAccount = (
  draft: CampaignDraftDto,
  account: DraftAddedAccountDto,
) => {
  const content = draft.campaignContent ?? [];
  const selectedContent = getSelectedContentRef(account);

  if (selectedContent) {
    const selectedItem = content.find(
      (item) => String(item._id) === String(selectedContent.campaignContentItemId),
    );
    if (selectedItem) return selectedItem;
  }

  // Never make an unfinished page look complete by borrowing another page's content.
  return undefined;
};

export const getDraftDetailsForm = (content?: CampaignContentItem): DraftDetailsForm => ({
  contentUrl: content?.mainLink ?? "",
  description: content?.descriptions?.[0]?.description ?? "",
  storyTag: content?.taggedUser ?? "",
  storyLink: content?.taggedLink ?? "",
  additionalBrief: content?.additionalBrief ?? "",
});

export const getDraftContentReadiness = (content?: CampaignContentItem): ContentReadiness => {
  if (!content) return { status: "empty", label: "Add publishing details" };

  const form = getDraftDetailsForm(content);
  const hasAnyValue =
    Object.values(form).some((value) => value.trim()) ||
    (content.descriptions ?? []).some((description) => description.description?.trim());
  return hasAnyValue
    ? { status: "ready", label: "Content added" }
    : { status: "empty", label: "Add publishing details" };
};

export const getDraftContentStatus = (content?: CampaignContentItem): ContentStatus =>
  getDraftContentReadiness(content).status;

export const isDraftReadyForCheckout = (
  draft: CampaignDraftDto,
  accounts: DraftAddedAccountDto[] = draft.addedAccounts ?? [],
) => {
  const selectedAccounts = accounts.filter(
    (account) => account.isAvailable !== false && account.isSelected !== false,
  );

  return selectedAccounts.length > 0 && selectedAccounts.every((account) => {
    const selectedContent = getSelectedContentRef(account);
    if (!selectedContent?.campaignContentItemId) return false;

    const content = (draft.campaignContent ?? []).find(
      (item) => String(item._id) === String(selectedContent.campaignContentItemId),
    );
    return getDraftContentStatus(content) === "ready";
  });
};

export const getDraftSocialMediaGroup = (
  socialMedia: string,
): CampaignContentItem["socialMediaGroup"] => {
  if (["spotify", "soundcloud"].includes(socialMedia)) return "music";
  if (["instagram", "tiktok", "facebook", "youtube"].includes(socialMedia)) return "main";
  return "press";
};

// Publishing details are intentionally permissive: clients may paste a URL, handle, note,
// description or another reference. The assistant stores what they provide without policing format.
export const validateDraftDetails = (form: DraftDetailsForm): DraftDetailsErrors => {
  void form;
  return {};
};
