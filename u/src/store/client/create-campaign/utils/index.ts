import { ObjectId } from "bson";

const oid = () => new ObjectId().toHexString();

const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/\*/g, "").replace(/\s+/g, "").replace(/-\d+$/, "");

const clean = (v: unknown) =>
  typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();

const str = (v: unknown) => (typeof v === "string" ? v : String(v ?? ""));
const trim = (v: unknown) => str(v).trim();
const lower = (v: unknown) => trim(v).toLowerCase();

type Group = "main" | "music" | "press";

export type AnyItem = {
  _id: string;
  socialMedia: string;
  socialMediaGroup: Group;
  mainLink: string;
  descriptions: Array<{ _id: string; description: string }>;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
};

function collectDescriptions(
  formData: Record<string, any>,
  prefix: string,
  group: Group,
): AnyItem["descriptions"] {
  const res: AnyItem["descriptions"] = [];

  for (const [key, value] of Object.entries(formData)) {
    if (!key.startsWith(prefix)) continue;

    const k = lower(key);

    const isDesc =
      group === "main"
        ? k.includes("postdescription")
        : group === "music"
          ? k.includes("track title")
          : k.includes("artwork");

    if (!isDesc) continue;

    const val = trim(value);
    if (!val) continue;

    res.push({ _id: oid(), description: val });
  }

  return res;
}

function hasAnyData(item: AnyItem) {
  if (trim(item.mainLink)) return true;
  if (item.descriptions.length) return true;
  if (trim(item.taggedUser) || trim(item.taggedLink)) return true;
  if (trim(item.additionalBrief)) return true;
  return false;
}

export const buildMainCampaignContent = (
  formData: Record<string, any>,
  platform: string,
) => {
  const platformLc = platform.toLowerCase();

  const basePrefixes = new Set<string>();

  const platformAdditionalPrefixes = new Set<string>();

  Object.keys(formData).forEach((key) => {
    const l = key.toLowerCase();
    if (!l.includes("content link")) return;

    const prefix = key.split("-Content link")[0];

    if (/^main-\d+$/i.test(prefix)) {
      basePrefixes.add(prefix);
      return;
    }

    if (prefix.toLowerCase().startsWith(`main-${platformLc}-additional-`)) {
      platformAdditionalPrefixes.add(prefix);
    }
  });

  const allPrefixes = [...basePrefixes, ...platformAdditionalPrefixes];

  return allPrefixes
    .map((prefix) => {
      const mainLink = clean(formData[`${prefix}-Content link*-0`]);

      if (!mainLink) return null;

      const descriptions = Object.entries(formData)
        .filter(
          ([k, v]) => k.startsWith(`${prefix}-Postdescription`) && clean(v),
        )
        .map(([_, v]) => ({
          _id: oid(),
          description: clean(v),
        }));

      const taggedUser = clean(formData[`${prefix}-Story tag-1`]);
      const taggedLink = clean(formData[`${prefix}-Story link-2`]);

      const additionalBrief =
        clean(formData[`${prefix}-Additional brief-0`]) ||
        clean(formData["Additional brief"]) ||
        "";

      return {
        _id: oid(),
        socialMedia: platformLc,
        socialMediaGroup: "main" as const,
        mainLink,
        descriptions,
        taggedUser,
        taggedLink,
        additionalBrief,
      };
    })
    .filter(Boolean);
};

const PREFIX_RX =
  /^(?:\d+-)?(main|music|press)(?:-([a-z0-9_]+))?-(0|additional-\d+)$/i;

function parsePrefix(prefix: string) {
  const m = prefix.match(PREFIX_RX);
  if (!m) return null;
  return {
    group: m[1].toLowerCase() as Group,
    platformInPrefix: (m[2] ?? "").toLowerCase(),
  };
}

function pickPrefixes(formData: Record<string, any>, group: Group) {
  const prefixes = new Set<string>();

  const masterNeedle =
    group === "main"
      ? "content link"
      : group === "music"
        ? "track link"
        : "link to music, events, news";

  for (const key of Object.keys(formData)) {
    if (!lower(key).includes(masterNeedle)) continue;

    const splitBy =
      group === "main"
        ? "-Content link"
        : group === "music"
          ? "-Track link"
          : "-Link to music, events, news";

    const prefix = key.split(splitBy)[0];
    if (prefix) prefixes.add(prefix);
  }

  return Array.from(prefixes);
}

export function parseFormsForDisplay(
  formData: Record<string, any>,
  socialMedia: string,
  socialMediaGroup: Group,
): AnyItem[] {
  const platform = lower(socialMedia);

  const prefixes = pickPrefixes(formData, socialMediaGroup);
  const items: AnyItem[] = [];

  for (const prefix of prefixes) {
    const info = parsePrefix(prefix);
    if (!info) continue;
    if (info.group !== socialMediaGroup) continue;

    if (info.platformInPrefix && info.platformInPrefix !== platform) continue;

    const item: AnyItem = {
      _id: oid(),
      socialMedia: platform,
      socialMediaGroup,
      mainLink: "",
      descriptions: collectDescriptions(formData, prefix, socialMediaGroup),
      taggedUser: "",
      taggedLink: "",
      additionalBrief: "",
    };

    for (const [key, value] of Object.entries(formData)) {
      if (!key.startsWith(prefix)) continue;

      const val = trim(value);
      if (!val) continue;

      const k = lower(key).replace(/\*/g, "");

      if (
        (socialMediaGroup === "main" && k.includes("content link")) ||
        (socialMediaGroup === "music" && k.includes("track link")) ||
        (socialMediaGroup === "press" &&
          k.includes("Link to music, events, news**"))
      ) {
        item.mainLink = val;
        continue;
      }

      if (socialMediaGroup === "main") {
        if (k.includes("story tag")) item.taggedUser = val;
        if (k.includes("story link")) item.taggedLink = val;
      }

      if (socialMediaGroup === "press") {
        if (k.includes("Link to press realese")) item.taggedLink = val;
      }

      if (k.includes("additional brief")) item.additionalBrief = val;
    }

    if (
      socialMediaGroup === "main" &&
      parsePrefix(prefix)?.platformInPrefix === "" &&
      !item.additionalBrief
    ) {
      item.additionalBrief = trim(formData["Additional brief"]);
    }

    if (!hasAnyData(item)) continue;
    items.push(item);
  }

  return items;
}

export const buildMusicCampaignContent = (
  formData: Record<string, any>,
  platform: string,
) => {
  const platformLc = platform.toLowerCase();
  const formPrefixes = new Set<string>();

  Object.keys(formData).forEach((key) => {
    if (key.toLowerCase().includes("track link")) {
      const prefix = key.split("-Track link")[0];
      if (prefix) formPrefixes.add(prefix);
    }
  });

  return [...formPrefixes]
    .map((prefix) => {
      let mainLink = "";
      let additionalBrief = "";

      Object.entries(formData).forEach(([key, value]) => {
        if (!key.startsWith(prefix)) return;

        const normalized = key.toLowerCase().replace(/\*/g, "");
        const val = trim(value);
        if (!val) return;

        if (normalized.includes("track link")) mainLink = val;
        if (normalized.includes("additional brief")) additionalBrief = val;
      });

      const descriptions = collectDescriptions(formData, prefix, "music");

      const item: AnyItem = {
        _id: oid(),
        socialMedia: platformLc,
        socialMediaGroup: "music" as const,
        mainLink,
        descriptions,
        taggedUser: "",
        taggedLink: "",
        additionalBrief,
      };

      if (!hasAnyData(item)) return null;
      return item;
    })
    .filter(Boolean);
};

export const buildPressCampaignContent = (
  formData: Record<string, any>,
  platform: string,
) => {
  const prefixes = new Set<string>();

  for (const key of Object.keys(formData)) {
    const k = key.toLowerCase();
    if (k.includes("press-") && k.includes("link to music, events, news")) {
      const prefix = key.split("-Link to music, events, news")[0];
      if (prefix) prefixes.add(prefix);
    }
  }

  return [...prefixes]
    .map((prefix) => {
      let mainLink = "";
      let artworkLink = "";
      let additionalBrief = "";

      for (const [key, value] of Object.entries(formData)) {
        if (!key.startsWith(prefix)) continue;

        const val = trim(value);
        if (!val) continue;

        const normalized = key.toLowerCase().replace(/\*/g, "");

        if (normalized.includes("link to music, events, news")) {
          mainLink = val;
          continue;
        }

        if (normalized.includes("additional brief")) {
          additionalBrief = val;
          continue;
        }
      }

      if (!additionalBrief)
        additionalBrief = trim(formData["Additional brief"]);

      const descriptions = [
        ...(collectDescriptions(formData, prefix, "press") ?? []),
        ...(artworkLink ? [{ _id: oid(), description: artworkLink }] : []),
      ];

      const item: AnyItem = {
        _id: oid(),
        socialMedia: "press",
        socialMediaGroup: "press" as const,
        mainLink,
        descriptions,
        taggedUser: "",
        taggedLink: "",
        additionalBrief,
      };

      if (!hasAnyData(item)) return null;
      return item;
    })
    .filter(Boolean);
};
