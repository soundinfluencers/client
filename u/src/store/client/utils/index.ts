export const buildCampaignContent = (
  formData: Record<string, string>,
  platform: string
) => {
  const campaignContent: any[] = [];

  const contentKeys = Object.keys(formData).filter((k) =>
    k.startsWith("Contentlink*")
  );
  const storyTagKeys = Object.keys(formData).filter((k) =>
    k.startsWith("Storytag")
  );
  const storyLinkKeys = Object.keys(formData).filter((k) =>
    k.startsWith("Storylink")
  );
  const briefKeys = Object.keys(formData).filter((k) =>
    k.startsWith("additionalBrief")
  );

  // 🔹 собираем ВСЕ postDescriptions ОДИН раз
  const allDescriptions = Object.entries(formData)
    .filter(([key]) => key.startsWith("Postdescription"))
    .map(([key, value]) => ({
      _id: `${Date.now()}-${key}`,
      description: value,
    }));

  // 🔹 создаем объект для каждой формы
  for (let i = 0; i < contentKeys.length; i++) {
    const videoLink = formData[contentKeys[i]] || "";
    const storyTag = formData[storyTagKeys[i]] || "";
    const swipeUpLink = formData[storyLinkKeys[i]] || "";
    const specialWishes = formData[briefKeys[i]] || "";

    campaignContent.push({
      _id: `${Date.now()}-${i}`,
      videoLink,
      ...(i === 0 && { postDescriptions: allDescriptions }), // ⭐ ВАЖНО
      storyTag,
      swipeUpLink,
      specialWishes,
      socialMedia: platform,
      socialMediaGroup: "main",
    });
  }

  return campaignContent;
};
const collectPostDescriptions = (formData: Record<string, string>) =>
  Object.entries(formData)
    .filter(([key]) => key.startsWith("Postdescription"))
    .map(([key, value]) => ({
      _id: `${Date.now()}-${key}`,
      description: value,
    }));

export const parseFormsForDisplay = (
  formData: Record<string, string>,
  socialMedia: string
) => {
  const result: Record<string, any>[] = [];

  const postDescriptions = collectPostDescriptions(formData);

  // 1. индексы форм
  const formIndexes = new Set<number>();

  Object.keys(formData).forEach((key) => {
    if (!key.includes("*")) return;

    const match = key.match(/-(\d+)$/);
    formIndexes.add(match ? Number(match[1]) : 1);
  });

  // 2. собираем формы
  [...formIndexes].sort().forEach((formIndex, idx) => {
    const form: Record<string, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "campaignName" || key.startsWith("Postdescription")) return;

      const match = key.match(/-(\d+)$/);
      const keyIndex = match ? Number(match[1]) : 1;

      if (keyIndex !== formIndex) return;

      const cleanKey = key.replace(/-\d+$/, "");
      form[cleanKey] = value;
    });

    result.push({
      ...form,
      ...(idx === 0 && { postDescriptions }), // ⭐ ТОЛЬКО первый объект
      socialMedia,
    });
  });

  return result;
};
