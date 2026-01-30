type AnyItem = {
  _id: string;
  socialMedia?: string;
  socialMediaGroup?: "main" | "music" | "press";
  mainLink?: string;
  descriptions?: any[];
  taggedUser?: string;
  taggedLink?: string;
  additionalBrief?: string;
};

const toStr = (v: unknown) => (typeof v === "string" ? v : "");
const norm = (v: unknown) => toStr(v).trim().toLowerCase();

const MAIN_COMMON_RX = /-main-(0|additional-\d+)$/i;

const MAIN_SPECIFIC_RX = /-main-([a-z0-9_]+)-additional-\d+$/i;

const MUSIC_COMMON_RX = /-music-(0|additional-\d+)$/i;

const PRESS_COMMON_RX = /-press-(0|additional-\d+)$/i;

export default function buildItemsForRow(
  all: AnyItem[],
  rowPlatform: string,
  rowGroup?: "main" | "music" | "press",
) {
  const platform = norm(rowPlatform);

  const group = rowGroup;

  const items = (all ?? []).filter(Boolean);

  const hasMainData = (it: AnyItem) => {
    const linkOk = !!norm(it.mainLink);
    const descOk = Array.isArray(it.descriptions) && it.descriptions.length > 0;
    const tagOk = !!norm(it.taggedUser) || !!norm(it.taggedLink);
    const briefOk = !!norm(it.additionalBrief);
    return linkOk || descOk || tagOk || briefOk;
  };

  if (group === "main") {
    const common = items.filter((it) => MAIN_COMMON_RX.test(toStr(it._id)));

    const specificForPlatform = items.filter((it) => {
      const id = toStr(it._id).toLowerCase();
      const m = id.match(MAIN_SPECIFIC_RX);
      if (!m) return false;
      return m[1] === platform;
    });

    const fallbackSpecific = items.filter(
      (it) =>
        toStr(it._id).toLowerCase().includes("additional") &&
        norm(it.socialMedia) === platform &&
        !MAIN_COMMON_RX.test(toStr(it._id)) &&
        !MAIN_SPECIFIC_RX.test(toStr(it._id)),
    );

    const merged = [
      ...common,
      ...specificForPlatform,
      ...fallbackSpecific,
    ].filter(hasMainData);

    const map = new Map<string, AnyItem>();
    for (const it of merged) map.set(it._id, it);

    return Array.from(map.values());
  }

  if (group === "music") {
    const common = items.filter((it) => MUSIC_COMMON_RX.test(toStr(it._id)));
    const specific = items.filter((it) => norm(it.socialMedia) === platform);

    const merged = [...common, ...specific].filter(hasMainData);

    const map = new Map<string, AnyItem>();
    for (const it of merged) map.set(it._id, it);

    return Array.from(map.values());
  }

  if (group === "press") {
    const common = items.filter((it) => PRESS_COMMON_RX.test(toStr(it._id)));
    const specific = items.filter((it) => norm(it.socialMedia) === platform);

    const merged = [...common, ...specific].filter(hasMainData);

    const map = new Map<string, AnyItem>();
    for (const it of merged) map.set(it._id, it);

    return Array.from(map.values());
  }

  return items
    .filter((it) => norm(it.socialMedia) === platform)
    .filter(hasMainData);
}
