import { ObjectId } from "bson";

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

const oid = () => new ObjectId().toHexString();

const toStr = (v: unknown) => (typeof v === "string" ? v : String(v ?? ""));
const trim = (v: unknown) => toStr(v).trim();
const clean = (v: unknown) => trim(v);
const lower = (v: unknown) => clean(v).toLowerCase();

const normKey = (k: string) =>
  k.toLowerCase().replace(/\*/g, "").replace(/\s+/g, " ").trim();

function getPrefixFromFieldKey(key: string): string {
  const noIndex = key.replace(/-\d+$/i, "");

  const m = noIndex.match(
    /^(main|music|press)(?:-[a-z0-9_]+)?-(?:0|additional-\d+)/i,
  );
  return m?.[0] ?? "";
}

function parsePrefix(prefix: string): {
  group: Group;
  platform: string;
  kind: "base" | "additional";
  additionalIndex?: number;
} | null {
  const p = prefix.toLowerCase();

  let m = p.match(/^(main|music|press)-0$/);
  if (m) {
    return { group: m[1] as Group, platform: "", kind: "base" };
  }

  m = p.match(/^(main|music|press)-([a-z0-9_]+)-additional-(\d+)$/);
  if (m) {
    return {
      group: m[1] as Group,
      platform: m[2],
      kind: "additional",
      additionalIndex: Number(m[3]),
    };
  }

  return null;
}

const FIELDS = {
  main: {
    mainLink: "content link",
    description: "postdescription",
    taggedUser: "story tag",
    taggedLink: "story link",
    additionalBrief: "additional brief",
  },
  music: {
    mainLink: "track link",
    description: "track title",
    additionalBrief: "additional brief",
  },
  press: {
    mainLink: "link to music, events, news",
    description: "artwork",
    taggedLink: "link to press realese",
    additionalBrief: "additional brief",
  },
} as const;

function hasAnyData(item: AnyItem) {
  if (trim(item.mainLink)) return true;
  if (item.descriptions.length) return true;
  if (trim(item.taggedUser) || trim(item.taggedLink)) return true;
  if (trim(item.additionalBrief)) return true;
  return false;
}

function collectAllPrefixes(formData: Record<string, any>): string[] {
  const prefixes = new Set<string>();

  for (const key of Object.keys(formData)) {
    const prefix = getPrefixFromFieldKey(key);
    if (!prefix) continue;

    const info = parsePrefix(prefix);
    if (!info) continue;

    prefixes.add(prefix);
  }

  return Array.from(prefixes);
}

function buildItemFromPrefix(
  formData: Record<string, any>,
  prefix: string,
  group: Group,
  platformOut: string,
): AnyItem {
  const dict = FIELDS[group];

  const item: AnyItem = {
    _id: oid(),
    socialMedia: platformOut,
    socialMediaGroup: group,
    mainLink: "",
    descriptions: [],
    taggedUser: "",
    taggedLink: "",
    additionalBrief: "",
  };

  for (const [rawKey, rawValue] of Object.entries(formData)) {
    if (!rawKey.startsWith(prefix + "-")) continue;

    const value = trim(rawValue);
    if (!value) continue;

    const k = normKey(rawKey);

    if ("mainLink" in dict && k.includes(dict.mainLink)) {
      item.mainLink = value;
      continue;
    }
    if ("description" in dict && k.includes(dict.description)) {
      item.descriptions.push({ _id: oid(), description: value });
      continue;
    }

    if ("taggedUser" in dict && k.includes(dict.taggedUser)) {
      item.taggedUser = value;
      continue;
    }
    if ("taggedLink" in dict && k.includes(dict.taggedLink)) {
      item.taggedLink = value;
      continue;
    }

    if ("additionalBrief" in dict && k.includes(dict.additionalBrief)) {
      item.additionalBrief = value;
      continue;
    }
  }

  if (!item.additionalBrief) {
    const global = trim(formData["Additional brief"]);
    if (global) item.additionalBrief = global;
  }

  item.descriptions.sort((a, b) => {
    return 0;
  });

  return item;
}

export function parseFormsForDisplay(
  formData: Record<string, any>,
  socialMedia: string,
  socialMediaGroup: Group,
): AnyItem[] {
  const platform = lower(socialMedia);
  const prefixes = collectAllPrefixes(formData);

  const items: AnyItem[] = [];

  for (const prefix of prefixes) {
    const info = parsePrefix(prefix);
    if (!info) continue;
    if (info.group !== socialMediaGroup) continue;

    if (info.kind === "additional" && info.platform !== platform) continue;

    const item = buildItemFromPrefix(
      formData,
      prefix,
      socialMediaGroup,
      platform,
    );

    if (!hasAnyData(item)) continue;

    items.push(item);
  }

  items.sort((a, b) => {
    const pa = parsePrefix(
      prefixes.find(
        (p) =>
          buildItemFromPrefix(formData, p, socialMediaGroup, platform)._id ===
          a._id,
      ) ?? "",
    );
    const pb = parsePrefix(
      prefixes.find(
        (p) =>
          buildItemFromPrefix(formData, p, socialMediaGroup, platform)._id ===
          b._id,
      ) ?? "",
    );

    return 0;
  });

  return items;
}

export function buildMainCampaignContent(
  formData: Record<string, any>,
  platform: string,
) {
  return parseFormsForDisplay(formData, platform, "main");
}

export function buildMusicCampaignContent(
  formData: Record<string, any>,
  platform: string,
) {
  return parseFormsForDisplay(formData, platform, "music");
}

export function buildPressCampaignContent(
  formData: Record<string, any>,
  platform: string,
) {
  return parseFormsForDisplay(formData, platform, "press");
}
