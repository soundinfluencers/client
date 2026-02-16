import { create } from "zustand";

type Desc = { _id: string; description: string };

type ContentPatch = Partial<{
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  descriptions: Desc[];
}>;

type UpdateState = {
  patches: Record<string, ContentPatch>;

  setField: (contentId: string, field: keyof ContentPatch, value: any) => void;

  setDescriptions: (contentId: string, next: Desc[]) => void;
  addDescription: (contentId: string, text?: string) => void;
  updateDescription: (contentId: string, index: number, text: string) => void;
  removeDescription: (contentId: string, index: number) => void;

  reset: () => void;
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

export const useUpdateCampaign = create<UpdateState>((set, get) => ({
  patches: {},

  setField: (contentId, field, value) =>
    set((s) => ({
      patches: {
        ...s.patches,
        [contentId]: {
          ...(s.patches[contentId] ?? {}),
          [field]: value,
        },
      },
    })),

  setDescriptions: (contentId, next) =>
    set((s) => ({
      patches: {
        ...s.patches,
        [contentId]: {
          ...(s.patches[contentId] ?? {}),
          descriptions: next,
        },
      },
    })),

  addDescription: (contentId, text = "") => {
    const curr = get().patches[contentId]?.descriptions ?? [];
    const next = [...curr, { _id: objectId(), description: text }];
    get().setDescriptions(contentId, next);
  },

  updateDescription: (contentId, index, text) => {
    const curr = get().patches[contentId]?.descriptions ?? [];
    const next = curr.map((d, i) =>
      i === index ? { ...d, description: text } : d,
    );
    get().setDescriptions(contentId, next);
  },

  removeDescription: (contentId, index) => {
    const curr = get().patches[contentId]?.descriptions ?? [];
    const next = curr.filter((_, i) => i !== index);
    get().setDescriptions(contentId, next);
  },

  reset: () => set({ patches: {} }),
}));
