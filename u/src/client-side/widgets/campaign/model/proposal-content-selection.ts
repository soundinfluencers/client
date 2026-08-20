type ProposalContentSelection = {
  campaignContentItemId: string;
  descriptionId: string;
  additionalBriefId?: string;
};

type ProposalAccountLike = {
  addedAccountsId?: unknown;
  accountId?: unknown;
  socialAccountId?: unknown;
  socialMedia?: unknown;
  selectedContent?: unknown;
  selectedCampaignContentItem?: unknown;
};

type ProposalContentLike = {
  _id?: unknown;
  socialMedia?: unknown;
  socialMediaGroup?: unknown;
  descriptions?: Array<{ _id?: unknown }>;
  additionalBrief?: Array<{ _id?: unknown }>;
};

const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

const toId = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const getAccountBusinessId = (account: ProposalAccountLike): string =>
  toId(account.socialAccountId) || toId(account.accountId);

export const getProposalContentGroupBySocial = (
  social: unknown,
): "main" | "music" | "press" => {
  const normalizedSocial = String(social ?? "").toLowerCase();

  if (MAIN_NETWORKS.includes(normalizedSocial)) return "main";
  if (MUSIC_NETWORKS.includes(normalizedSocial)) return "music";
  return "press";
};

export const getCompatibleProposalContentItems = <
  TContent extends ProposalContentLike,
>(
  account: Pick<ProposalAccountLike, "socialMedia">,
  items: readonly TContent[],
): TContent[] => {
  const social = String(account.socialMedia ?? "").toLowerCase();
  const socialItems = items.filter(
    (item) => String(item.socialMedia ?? "").toLowerCase() === social,
  );

  if (socialItems.length) return socialItems;

  const socialGroup = getProposalContentGroupBySocial(social);
  const groupItems = items.filter(
    (item) => item.socialMediaGroup === socialGroup,
  );

  if (social === "instagram") return groupItems;
  if (socialGroup === "main") return groupItems.slice(0, 1);

  return groupItems;
};

export const resolveValidProposalContentSelection = (
  account: Pick<
    ProposalAccountLike,
    "selectedContent" | "selectedCampaignContentItem"
  >,
): ProposalContentSelection | null => {
  const candidates = [
    account.selectedContent,
    account.selectedCampaignContentItem,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    if (typeof candidate !== "object") return null;

    const value = candidate as Record<string, unknown>;
    const campaignContentItemId = toId(value.campaignContentItemId);
    const descriptionId = toId(value.descriptionId);
    const additionalBriefId = toId(value.additionalBriefId);

    return campaignContentItemId && descriptionId
      ? {
        campaignContentItemId,
        descriptionId,
        ...(additionalBriefId ? { additionalBriefId } : {}),
      }
      : null;
  }

  return null;
};

export const initializeNewProposalAccountContentSelections = <
  TAccount extends ProposalAccountLike,
  TContent extends ProposalContentLike,
>({
  accounts,
  currentAccounts,
  contentItems,
}: {
  accounts: readonly TAccount[];
  currentAccounts: readonly ProposalAccountLike[];
  contentItems: readonly TContent[];
}): {
  accounts: TAccount[];
  unresolvedNewAccountGroups: Array<"main" | "music" | "press">;
} => {
  const currentByBusinessId = new Map(
    currentAccounts
      .map((account) => [getAccountBusinessId(account), account] as const)
      .filter(([accountId]) => Boolean(accountId)),
  );
  const unresolvedNewAccountGroups = new Set<"main" | "music" | "press">();

  const nextAccounts = accounts.map((account) => {
    const accountId = getAccountBusinessId(account);
    const current = currentByBusinessId.get(accountId);
    const explicitSelection =
      resolveValidProposalContentSelection(account) ??
      (current ? resolveValidProposalContentSelection(current) : null);

    if (explicitSelection) return account;

    const hasPersistedIdentity = Boolean(
      toId(account.addedAccountsId) || toId(current?.addedAccountsId),
    );
    if (hasPersistedIdentity) return account;

    const group = getProposalContentGroupBySocial(account.socialMedia);
    const firstCompatibleContent = getCompatibleProposalContentItems(
      account,
      contentItems,
    )[0];
    const campaignContentItemId = toId(firstCompatibleContent?._id);
    const descriptionId = toId(firstCompatibleContent?.descriptions?.[0]?._id);
    const additionalBriefId = toId(
      firstCompatibleContent?.additionalBrief?.[0]?._id,
    );

    if (!campaignContentItemId || !descriptionId) {
      unresolvedNewAccountGroups.add(group);
      return account;
    }

    const selection = {
      campaignContentItemId,
      descriptionId,
      ...(additionalBriefId ? { additionalBriefId } : {}),
    };

    return {
      ...account,
      selectedContent: selection,
      selectedCampaignContentItem: selection,
    };
  });

  return {
    accounts: nextAccounts,
    unresolvedNewAccountGroups: [...unresolvedNewAccountGroups],
  };
};
