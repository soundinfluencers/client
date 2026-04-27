import React from "react";
import type { SocialMediaType } from "@/types/utils/constants.types";

type GroupKey = "main" | "music" | "press";

type AdditionalFormItem = {
  id: string;
  group: GroupKey;
  socialMedia: string;
};

type AdditionalSelection = GroupKey | null;

const buildAdditionalId = (
    group: GroupKey,
    socialMedia: string,
    index: number,
) => `${group}-${String(socialMedia).toLowerCase()}-additional-${index}`;

const parseAdditionalFormId = (id: string) => {
  const match = id.match(/^(main|music|press)-([a-z0-9_]+)-additional-(\d+)$/i);
  if (!match) return null;

  return {
    group: match[1] as GroupKey,
    socialMedia: match[2].toLowerCase(),
    index: Number(match[3]),
  };
};

const stableSortForms = (forms: AdditionalFormItem[]) => {
  return [...forms].sort((a, b) => {
    const pa = parseAdditionalFormId(a.id);
    const pb = parseAdditionalFormId(b.id);

    if (!pa || !pb) return 0;
    if (pa.group !== pb.group) return pa.group.localeCompare(pb.group);
    if (pa.socialMedia !== pb.socialMedia) {
      return pa.socialMedia.localeCompare(pb.socialMedia);
    }

    return pa.index - pb.index;
  });
};

const collectAdditionalFormsFromDraft = (
    draft?: Record<string, string>,
): AdditionalFormItem[] => {
  if (!draft) return [];

  const map = new Map<string, AdditionalFormItem>();

  Object.keys(draft).forEach((key) => {
    const normalized = key.replace(/-\d+$/i, "");
    const match = normalized.match(
        /^(main|music|press)-([a-z0-9_]+)-additional-(\d+)/i,
    );

    if (!match) return;

    const id = `${match[1]}-${match[2].toLowerCase()}-additional-${match[3]}`;

    if (!map.has(id)) {
      map.set(id, {
        id,
        group: match[1] as GroupKey,
        socialMedia: match[2].toLowerCase(),
      });
    }
  });

  return stableSortForms(Array.from(map.values()));
};

export const useAdditionalForms = (
    draftValues: Record<string, string> | undefined,
    setDraftValues: (next: Record<string, string>) => void,
) => {
  const [additionalSelection, setAdditionalSelection] =
      React.useState<AdditionalSelection>(null);

  const [additionalForms, setAdditionalForms] = React.useState<AdditionalFormItem[]>(
      () => collectAdditionalFormsFromDraft(draftValues),
  );

  const toggleAdditionalSelection = React.useCallback((group: GroupKey) => {
    setAdditionalSelection((prev) => (prev === group ? null : group));
  }, []);

  const getAdditionalIndex = React.useCallback((id: string) => {
    const parsed = parseAdditionalFormId(id);
    return parsed?.index ?? 1;
  }, []);

  const getFormPrefix = React.useCallback((form: AdditionalFormItem) => {
    return form.id;
  }, []);

  const addAdditionalForm = React.useCallback(
      (group: GroupKey, socialMedia: SocialMediaType) => {
        setAdditionalForms((prev) => {
          const normalizedSocial = String(socialMedia).toLowerCase();

          const usedIndexes = prev
              .filter(
                  (item) =>
                      item.group === group && item.socialMedia === normalizedSocial,
              )
              .map((item) => parseAdditionalFormId(item.id)?.index ?? 0);

          const nextIndex = usedIndexes.length ? Math.max(...usedIndexes) + 1 : 1;
          const id = buildAdditionalId(group, normalizedSocial, nextIndex);

          if (prev.some((item) => item.id === id)) return prev;

          return stableSortForms([
            ...prev,
            {
              id,
              group,
              socialMedia: normalizedSocial,
            },
          ]);
        });

        setAdditionalSelection(null);
      },
      [],
  );

  const removeAdditionalForm = React.useCallback(
      (formId: string, prefix: string) => {
        setAdditionalForms((prev) => prev.filter((form) => form.id !== formId));

        const nextDraft = { ...(draftValues ?? {}) };

        Object.keys(nextDraft).forEach((key) => {
          if (key.startsWith(`${prefix}-`)) {
            delete nextDraft[key];
          }
        });

        setDraftValues(nextDraft);
        setAdditionalSelection(null);
      },
      [draftValues, setDraftValues],
  );

  const groupAdditionalByGroup = React.useMemo(() => {
    return {
      main: additionalForms.filter((item) => item.group === "main"),
      music: additionalForms.filter((item) => item.group === "music"),
      press: additionalForms.filter((item) => item.group === "press"),
    };
  }, [additionalForms]);

  return {
    additionalSelection,
    toggleAdditionalSelection,
    addAdditionalForm,
    groupAdditionalByGroup,
    getAdditionalIndex,
    getFormPrefix,
    removeAdditionalForm,
  };
};