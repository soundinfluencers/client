type SelectedContent = { campaignContentItemId: string; descriptionId: string };

type AnyAccount = any;
type AnyContent = any;

const MAIN_NETWORKS = new Set(["facebook", "instagram", "youtube", "tiktok"]);
const MUSIC_NETWORKS = new Set(["spotify", "soundcloud"]);

const getGroupBySocial = (socialMedia: string): "main" | "music" | "press" => {
  const sm = String(socialMedia || "").toLowerCase();
  if (MAIN_NETWORKS.has(sm)) return "main";
  if (MUSIC_NETWORKS.has(sm)) return "music";
  return "press";
};

const objectId = () => {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 12; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const isObjectId = (v: any) => /^[a-f\d]{24}$/i.test(String(v ?? ""));

const pickSocialAccountId = (a: AnyAccount) =>
  String(a.socialAccountId ?? a.accountId ?? "");

const pickSelected = (a: AnyAccount): SelectedContent | null => {
  const s = a.selectedCampaignContentItem ?? a.selectedContent ?? null;
  if (!s?.campaignContentItemId || !s?.descriptionId) return null;
  return {
    campaignContentItemId: String(s.campaignContentItemId),
    descriptionId: String(s.descriptionId),
  };
};

const ensureMongoIdsForContent = (content: AnyContent[]) => {
  return (content ?? []).map((c) => {
    const next = { ...c };

    if (!isObjectId(next._id)) next._id = objectId();

    next.descriptions = (next.descriptions ?? []).map((d: any) => {
      const dd = { ...d };
      if (!isObjectId(dd._id)) dd._id = objectId();
      dd.description = String(dd.description ?? "");
      return dd;
    });

    next.socialMedia = String(next.socialMedia ?? "").toLowerCase();
    next.socialMediaGroup = String(
      next.socialMediaGroup ?? getGroupBySocial(next.socialMedia),
    );
    next.mainLink = String(next.mainLink ?? "");
    next.taggedUser = String(next.taggedUser ?? "");
    next.taggedLink = String(next.taggedLink ?? "");
    next.additionalBrief = String(next.additionalBrief ?? "");

    return next;
  });
};

const pickDefaultSelectedForSocial = (
  socialMedia: string,
  content: AnyContent[],
): SelectedContent | null => {
  const sm = String(socialMedia || "").toLowerCase();
  if (!content?.length) return null;

  const bySameSocial =
    content.find((c) => String(c.socialMedia || "").toLowerCase() === sm) ??
    null;

  const byGroup =
    content.find(
      (c) => String(c.socialMediaGroup || "") === getGroupBySocial(sm),
    ) ?? null;

  const fallbackMain =
    content.find((c) => String(c.socialMediaGroup || "") === "main") ?? null;

  const item = bySameSocial ?? byGroup ?? fallbackMain ?? content[0] ?? null;
  if (!item?._id) return null;

  const descId = item.descriptions?.[0]?._id;
  if (!descId) return null;

  return {
    campaignContentItemId: String(item._id),
    descriptionId: String(descId),
  };
};
const ensureValidSelected = (
  selected: SelectedContent | null,
  contentNext: AnyContent[],
): SelectedContent | null => {
  if (!selected) return null;

  const item = contentNext.find(
    (c) => String(c._id) === String(selected.campaignContentItemId),
  );
  if (!item) return null;

  const has = (item.descriptions ?? []).some(
    (d: any) => String(d._id) === String(selected.descriptionId),
  );
  if (has) return selected;

  const fallback = item.descriptions?.[0]?._id;
  if (!fallback) return null;

  return {
    campaignContentItemId: String(item._id),
    descriptionId: String(fallback),
  };
};

const mapAccountToApi = (a: AnyAccount, contentNext: AnyContent[]) => {
  const rawSelected =
    pickSelected(a) ?? pickDefaultSelectedForSocial(a.socialMedia, contentNext);

  const selected = ensureValidSelected(rawSelected, contentNext); // ✅

  return {
    socialAccountId: pickSocialAccountId(a),
    influencerId: String(a.influencerId ?? ""),
    socialMedia: String(a.socialMedia ?? "").toLowerCase(),
    username: String(a.username ?? ""),
    selectedCampaignContentItem: selected ?? undefined,
    dateRequest: String(a.dateRequest ?? "ASAP"),
  };
};

const mapContentToApi = (c: AnyContent) => ({
  _id: String(c._id ?? ""), // обязателен
  socialMedia: String(c.socialMedia ?? "").toLowerCase(),
  socialMediaGroup: String(
    c.socialMediaGroup ?? getGroupBySocial(c.socialMedia),
  ),
  mainLink: String(c.mainLink ?? ""),
  descriptions: (c.descriptions ?? []).map((d: any) => ({
    _id: String(d._id ?? ""), // обязателен
    description: String(d.description ?? ""),
  })),
  taggedUser: String(c.taggedUser ?? ""),
  taggedLink: String(c.taggedLink ?? ""),
  additionalBrief: String(c.additionalBrief ?? ""),
});

/**
 * ✅ Клонируем шаблон под новую соцсеть, но создаём НОВЫЕ mongo id
 */
const cloneContentForSocial = (template: AnyContent, socialMedia: string) => {
  const sm = String(socialMedia).toLowerCase();

  const cloned: AnyContent = {
    ...template,
    _id: objectId(), // ✅ новый _id
    socialMedia: sm,
    socialMediaGroup: getGroupBySocial(sm),
    descriptions: (template.descriptions ?? []).map((d: any) => ({
      _id: objectId(), // ✅ новый _id
      description: String(d.description ?? ""),
    })),
  };

  return cloned;
};
type Desc = { _id: string; description: string };

type ContentPatch = Partial<{
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  descriptions: Desc[];
}>;

const applyPatchesToContent = (
  content: AnyContent[],
  patches: Record<string, ContentPatch>,
) => {
  return (content ?? []).map((c) => {
    const id = String(c._id ?? "");
    const p = patches?.[id];
    if (!p) return c;

    return {
      ...c,
      ...p,
      descriptions: p.descriptions ?? c.descriptions,
    };
  });
};
export function buildProposalPatchBody(args: {
  campaignName: string;
  accounts: AnyAccount[];
  content: AnyContent[];
  patches?: Record<string, ContentPatch>;
  inheritContentTemplateFrom?: "main" | "music" | "press";
}) {
  const {
    campaignName,
    accounts,
    content,
    patches = {},
    inheritContentTemplateFrom,
  } = args;
  const contentPatched = applyPatchesToContent(content ?? [], patches);
  const baseContent = ensureMongoIdsForContent(contentPatched ?? []);

  const socialsNeeded = Array.from(
    new Set(
      (accounts ?? [])
        .map((a) => String(a.socialMedia ?? "").toLowerCase())
        .filter(Boolean),
    ),
  );
  const socialsHave = new Set(
    (baseContent ?? [])
      .map((c) => String(c.socialMedia ?? "").toLowerCase())
      .filter(Boolean),
  );

  const template =
    (inheritContentTemplateFrom
      ? (baseContent ?? []).find(
          (c) =>
            String(c.socialMediaGroup || "") === inheritContentTemplateFrom,
        )
      : null) ??
    (baseContent ?? []).find(
      (c) => String(c.socialMediaGroup || "") === "main",
    ) ??
    (baseContent ?? [])[0] ??
    null;

  const contentNext: AnyContent[] = [...baseContent];

  if (template) {
    socialsNeeded.forEach((sm) => {
      if (socialsHave.has(sm)) return;
      contentNext.push(cloneContentForSocial(template, sm));
      socialsHave.add(sm);
    });
  }

  const normalizedNext = ensureMongoIdsForContent(contentNext);

  return {
    campaignName: String(campaignName ?? ""),
    addedAccounts: (accounts ?? [])
      .map((a) => mapAccountToApi(a, normalizedNext))
      .filter((a) => a.socialAccountId && a.influencerId && a.socialMedia),
    campaignContent: normalizedNext.map(mapContentToApi),
  };
}
