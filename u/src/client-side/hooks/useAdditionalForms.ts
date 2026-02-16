import React from "react";
import type { SocialMediaType } from "@/types/utils/constants.types";
import {
  buildAdditionalId,
  getAdditionalIndex,
  parseAdditionalFormsFromDraft,
} from "../utils";

export type GroupKey = "main" | "music" | "press";

export type AdditionalForm = {
  id: string;
  group: GroupKey;
  socialMedia: SocialMediaType;
};

const GROUP_ORDER: Record<GroupKey, number> = { main: 0, music: 1, press: 2 };

const stableSortForms = (forms: AdditionalForm[]) => {
  return [...forms].sort((a, b) => {
    const g = GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    if (g !== 0) return g;

    const ai = getAdditionalIndex(a.id);
    const bi = getAdditionalIndex(b.id);
    if (ai !== bi) return ai - bi;

    const sm = String(a.socialMedia).localeCompare(String(b.socialMedia));
    if (sm !== 0) return sm;

    return a.id.localeCompare(b.id);
  });
};

export function useAdditionalForms(draft?: Record<string, string>) {
  const [additionalSelection, setAdditionalSelection] =
    React.useState<GroupKey | null>(null);

  const [additionalForms, setAdditionalForms] = React.useState<
    AdditionalForm[]
  >(() => {
    const fromDraft = parseAdditionalFormsFromDraft(draft);
    return stableSortForms(fromDraft);
  });

  React.useEffect(() => {
    console.log("=== CURRENT ADDITIONAL FORMS ===", additionalForms);
  }, [additionalForms]);

  React.useEffect(() => {
    const fromDraft = parseAdditionalFormsFromDraft(draft);
    setAdditionalForms(stableSortForms(fromDraft));
  }, [draft]);

  const toggleAdditionalSelection = React.useCallback((group: GroupKey) => {
    setAdditionalSelection((prev) => (prev === group ? null : group));
  }, []);

  const addAdditionalForm = React.useCallback(
    (group: GroupKey, socialMedia: SocialMediaType) => {
      setAdditionalForms((prev) => {
        const used = prev
          .filter((x) => x.group === group)
          .map((x) => getAdditionalIndex(x.id))
          .filter((n) => Number.isFinite(n));

        const nextIndex = used.length ? Math.max(...used) + 1 : 1;
        const id = buildAdditionalId(group, socialMedia, nextIndex);

        if (prev.some((x) => x.id === id)) return prev;

        console.log("=== ADD ADDITIONAL FORM ===", {
          group,
          socialMedia,
          nextIndex,
          id,
        });

        return stableSortForms([...prev, { id, group, socialMedia }]);
      });

      setAdditionalSelection(null);
    },
    [],
  );

  const getFormPrefix = React.useCallback((f: AdditionalForm) => {
    const n = getAdditionalIndex(f.id);
    return `${f.group}-${f.socialMedia}-additional-${n}`;
  }, []);

  const groupAdditionalByGroup = React.useMemo(() => {
    const map: Record<GroupKey, AdditionalForm[]> = {
      main: [],
      music: [],
      press: [],
    };
    for (const f of additionalForms) map[f.group].push(f);
    return map;
  }, [additionalForms]);

  return {
    additionalSelection,
    toggleAdditionalSelection,
    addAdditionalForm,

    additionalForms,
    groupAdditionalByGroup,

    getAdditionalIndex,
    getFormPrefix,
  };
}
