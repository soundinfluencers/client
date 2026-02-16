import type { SocialMediaType } from "@/types/utils/constants.types";

export type GroupKey = "main" | "music" | "press";

export type AdditionalForm = {
  id: string;
  group: GroupKey;
  socialMedia: SocialMediaType;
};

export const isGroupKey = (v: string): v is GroupKey =>
  v === "main" || v === "music" || v === "press";

export const getAdditionalIndex = (id: string): number => {
  const m = id.match(/additional-(\d+)$/);
  return m ? Number(m[1]) : 1;
};

export const buildAdditionalId = (
  group: GroupKey,
  socialMedia: SocialMediaType,
  index: number,
) => `${group}-${socialMedia}-additional-${index}`;

export const parseAdditionalFormsFromDraft = (
  draft?: Record<string, string>,
): AdditionalForm[] => {
  if (!draft) return [];

  const map = new Map<string, AdditionalForm>();

  for (const key of Object.keys(draft)) {
    const parts = key.split("-");
    if (parts.length < 5) continue;

    const groupRaw = parts[0];
    const socialRaw = parts[1];
    const isAdditional = parts[2] === "additional";
    const nRaw = parts[3];

    if (!isGroupKey(groupRaw)) continue;
    if (!isAdditional) continue;
    if (!nRaw || Number.isNaN(Number(nRaw))) continue;

    const group = groupRaw;
    const socialMedia = socialRaw as SocialMediaType;
    const id = buildAdditionalId(group, socialMedia, Number(nRaw));

    if (!map.has(id)) map.set(id, { id, group, socialMedia });
  }

  return Array.from(map.values());
};

export const sortAdditionalForms = (forms: AdditionalForm[]) =>
  [...forms].sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    if (a.socialMedia !== b.socialMedia)
      return String(a.socialMedia).localeCompare(String(b.socialMedia));
    return getAdditionalIndex(a.id) - getAdditionalIndex(b.id);
  });
