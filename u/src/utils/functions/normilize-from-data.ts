export type PlatformForm = {
  items: Record<string, string>[];
  postDescriptions: string[];
};

// Нормализованная форма
type NormalizedForm = {
  campaignName?: string;
  items: Record<string, string>[];
  postDescriptions: string[];
};

// Нормализация formData
export function normalizeFormData(
  data: Record<string, string>
): NormalizedForm {
  const items: Record<number, Record<string, string>> = {};
  const postDescriptions: string[] = [];
  let campaignName: string | undefined;

  Object.entries(data).forEach(([key, value]) => {
    if (key === "campaignName") {
      campaignName = value;
      return;
    }

    const match = key.match(/(.+?)(?:-(\d+))?$/);
    if (!match) return;

    const field = match[1];
    const index = match[2] ? Number(match[2]) - 1 : 0;

    // ✅ ВСЕ Postdescription — в один массив
    if (field === "Postdescription") {
      postDescriptions.push(value);
      return;
    }

    if (!items[index]) {
      items[index] = {};
    }

    items[index][field] = value;
  });

  return {
    campaignName,
    items: Object.values(items),
    postDescriptions,
  };
}

export function mapNormalizedToPlatform(
  normalized: NormalizedForm
): PlatformForm {
  return {
    postDescriptions: [...normalized.postDescriptions],
    items: [...normalized.items],
  };
}
