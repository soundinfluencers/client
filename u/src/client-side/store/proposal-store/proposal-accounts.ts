import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import { ObjectId } from "bson";
import {useUpdateCampaign} from "@/client-side/store";

export const getAccountKey = (n: CampaignAddedAccount) =>
  String((n as any).addedAccountsId ?? (n as any).accountId);
const oid = () => new ObjectId().toHexString();

// type CampaignContentItem = {
//   _id: string;
//   socialMediaGroup: "main" | "music" | "press";
//   descriptions?: Array<{ _id: string }>;
//   socialMedia?: string;
// };
type CampaignContentItem = {
  _id: string;
  socialMedia?: string;
  socialMediaGroup: "main" | "music" | "press";
  mainLink?: string;
  taggedUser?: string;
  taggedLink?: string;
  additionalBrief?: string;
  descriptions?: Array<{ _id: string }>;
};
type ProposalAccountsStore = {
  accountsByOption: Record<number, CampaignAddedAccount[]>;
  contentByOption: Record<number, CampaignContentItem[]>;
  recentlyAddedKeysByOption: Record<number, Record<string, true>>;
  markRecentlyAdded: (optionIndex: number, keys: string[]) => void;
  clearRecentlyAdded: (optionIndex: number, keys?: string[]) => void;
  pendingDeleteKeysByOption: Record<number, Record<string, true>>;
  markPendingDelete: (optionIndex: number, key: string) => void;
  clearPendingDelete: (optionIndex: number, key?: string) => void;
  initOption: (
    optionIndex: number,
    serverAccounts: CampaignAddedAccount[],
    serverContent: any[],
    opts?: { force?: boolean },
  ) => void;
  addContentForSocial: (
      optionIndex: number,
      socialMedia: string,
      payload: { mainLink: string },
      inheritFromContentId?: string,
  ) => {
    contentId: string;
    firstDescriptionId: string;
  };
  addAccounts: (optionIndex: number, accounts: CampaignAddedAccount[]) => void;
  removeContentItem: (optionIndex: number, contentId: string) => void;
  mergeContent: (optionIndex: number, contentToAdd: any[]) => void;
  setAccountDateRequest: (
    optionIndex: number,
    accountKey: string,
    dateRequest: string,
  ) => void;
  setAccountSelectedContent: (
      optionIndex: number,
      accountKey: string,
      selected: {
        campaignContentItemId: string;
        descriptionId: string;
      },
  ) => void;
  currentCampaignId: string | null;
  setCurrentCampaignId: (id: string | null) => void;
  clearAll: () => void;
  removeAccount: (optionIndex: number, accountKey: string) => void;
  setAccounts: (optionIndex: number, accounts: CampaignAddedAccount[]) => void;
  clearOption: (optionIndex: number) => void;
  updateContentMainLink: (
      optionIndex: number,
      contentId: string,
      mainLink: string,
  ) => void;
};

export const useProposalAccountsStore = create<ProposalAccountsStore>()(
  devtools((set) => ({
    accountsByOption: {},
    contentByOption: {},
    recentlyAddedKeysByOption: {},
    pendingDeleteKeysByOption: {},
    currentCampaignId: null,
    setCurrentCampaignId: (id) => set({ currentCampaignId: id }),
    markPendingDelete: (optionIndex, key) => {
      set((state) => {
        const prev = state.pendingDeleteKeysByOption?.[optionIndex] ?? {};

        return {
          pendingDeleteKeysByOption: {
            ...(state.pendingDeleteKeysByOption ?? {}),
            [optionIndex]: {
              ...prev,
              [String(key)]: true,
            },
          },
        };
      });
    },
    updateContentMainLink: (optionIndex, contentId, mainLink) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.contentByOption[optionIndex] ?? [];

        const next = prev.map((item) =>
            String(item._id) === String(contentId)
                ? { ...item, mainLink }
                : item,
        );

        return {
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: next,
          },
        };
      });
    },
    clearAll: () =>
        set({
          currentCampaignId: null,
          accountsByOption: {},
          contentByOption: {},
          recentlyAddedKeysByOption: {},
          pendingDeleteKeysByOption: {},
        }),
    clearPendingDelete: (optionIndex, key) => {
      set((state) => {
        const all = { ...(state.pendingDeleteKeysByOption ?? {}) };

        if (!key) {
          delete all[optionIndex];
          return { pendingDeleteKeysByOption: all };
        }

        const prev = all[optionIndex] ?? {};
        const next = { ...prev };
        delete next[String(key)];

        all[optionIndex] = next;

        return {
          pendingDeleteKeysByOption: all,
        };
      });
    },
    setAccountSelectedContent: (optionIndex, accountKey, selected) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.accountsByOption[optionIndex] ?? [];

        const next = prev.map((account) =>
            getAccountKey(account) === String(accountKey)
                ? {
                  ...account,
                  selectedContent: selected,
                  selectedCampaignContentItem: selected,
                }
                : account,
        );

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: next,
          },
        };
      });
    },
    initOption: (optionIndex, serverAccounts, serverContent, opts) => {
      set((state) => {
        const exists = state.contentByOption[optionIndex];
        if (exists && !opts?.force) return state;

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: serverAccounts ?? [],
          },
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: serverContent ?? [],
          },
        };
      });
    },
    setAccountDateRequest: (optionIndex, accountKey, dateRequest) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.accountsByOption[optionIndex] ?? [];
        const next = prev.map((a) =>
            getAccountKey(a) === accountKey ? { ...a, dateRequest } : a,
        );

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: next,
          },
        };
      });
    },
    addContentForSocial: (
        optionIndex,
        socialMedia,
        payload,
        inheritFromContentId,
    ) => {
      useUpdateCampaign.getState().markDirty();
      const sm = String(socialMedia ?? "").toLowerCase();
      const group = getGroupBySocial(sm);
      const newId = oid();

      let firstDescriptionId = "";

      set((state) => {
        const prev = state.contentByOption[optionIndex] ?? [];

        const base =
            (inheritFromContentId
                ? prev.find((c) => c._id === inheritFromContentId)
                : prev.find((c) => String(c.socialMedia ?? "").toLowerCase() === sm)) ??
            prev.find((c) => c.socialMediaGroup === group);

        const descriptions = (base?.descriptions ?? []).map((d: any) => ({
          _id: oid(),
          description: d.description ?? "",
        }));

        firstDescriptionId = String(descriptions?.[0]?._id ?? "");

        const nextItem: CampaignContentItem = {
          _id: newId,
          socialMedia: sm,
          socialMediaGroup: group,
          mainLink: payload.mainLink,
          taggedUser: base?.taggedUser ?? "",
          taggedLink: base?.taggedLink ?? "",
          additionalBrief: base?.additionalBrief ?? "",
          descriptions,
        };

        return {
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: [...prev, nextItem],
          },
        };
      });

      return {
        contentId: newId,
        firstDescriptionId,
      };
    },
    removeContentItem: (optionIndex, contentId) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.contentByOption[optionIndex] ?? [];
        const next = prev.filter((c) => String(c._id) !== String(contentId));
        if (next.length === prev.length) return state;

        return {
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: next,
          },
        };
      });
    },
    mergeContent: (optionIndex, contentToAdd) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.contentByOption[optionIndex] ?? [];
        const incoming = contentToAdd ?? [];

        const map = new Map<string, any>();
        [...prev, ...incoming].forEach((it) => {
          if (!it) return;
          const key = String(it._id ?? `${it.socialMedia}-${it.mainLink ?? ""}`);
          map.set(key, it);
        });

        return {
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: Array.from(map.values()),
          },
        };
      });
    },

    // addAccounts: (optionIndex, accounts) => {
    //   set((state: any) => {
    //     const prev = state.accountsByOption[optionIndex] ?? [];
    //     const prevKeys = new Set(prev.map(getAccountKey));

    //     const content = state.contentByOption[optionIndex] ?? [];
    //     const mainItem = content.find((c) => c.socialMediaGroup === "main");

    //     const next = (accounts ?? [])
    //       .filter((a) => !prevKeys.has(getAccountKey(a)))
    //       .map((a) => {
    //         const sm = String(a.socialMedia || "").toLowerCase();
    //         const isMain = [
    //           "facebook",
    //           "instagram",
    //           "youtube",
    //           "tiktok",
    //         ].includes(sm);

    //         if (isMain && mainItem) {
    //           const def = {
    //             campaignContentItemId: mainItem._id,
    //             descriptionId: mainItem.descriptions?.[0]?._id ?? "",
    //           };
    //           return {
    //             ...a,
    //             selectedContent: def,
    //             selectedCampaignContentItem: def,
    //           };
    //         }

    //         return {
    //           ...a,
    //           selectedContent: null,
    //           selectedCampaignContentItem: null,
    //         };
    //       });

    //     if (!next.length) return state;

    //     return {
    //       accountsByOption: {
    //         ...state.accountsByOption,
    //         [optionIndex]: [...prev, ...next],
    //       },
    //     };
    //   });
    // },
    markRecentlyAdded: (optionIndex, keys) => {
      set((state) => {
        const prev = state.recentlyAddedKeysByOption?.[optionIndex] ?? {};
        const next = { ...prev };
        (keys ?? []).forEach((k) => {
          next[String(k)] = true;
        });

        return {
          recentlyAddedKeysByOption: {
            ...(state.recentlyAddedKeysByOption ?? {}),
            [optionIndex]: next,
          },
        };
      });
    },

    clearRecentlyAdded: (optionIndex, keys) => {
      set((state) => {
        const all = { ...(state.recentlyAddedKeysByOption ?? {}) };

        if (!keys?.length) {
          delete all[optionIndex];
          return { recentlyAddedKeysByOption: all };
        }

        const prev = all[optionIndex] ?? {};
        const next = { ...prev };
        keys.forEach((k) => delete next[String(k)]);

        all[optionIndex] = next;
        return { recentlyAddedKeysByOption: all };
      });
    },
    addAccounts: (optionIndex, accounts) => {
      set((state: any) => {
        useUpdateCampaign.getState().markDirty();
        const prev = state.accountsByOption[optionIndex] ?? [];
        const prevKeys = new Set(prev.map(getAccountKey));

        const content = state.contentByOption[optionIndex] ?? [];
        const mainItem = content.find((c) => c.socialMediaGroup === "main");

        const addedRaw = (accounts ?? []).filter(
          (a) => !prevKeys.has(getAccountKey(a)),
        );

        const next = addedRaw.map((a) => {
          const sm = String(a.socialMedia || "").toLowerCase();
          const isMain = [
            "facebook",
            "instagram",
            "youtube",
            "tiktok",
          ].includes(sm);

          if (isMain && mainItem) {
            const def = {
              campaignContentItemId: mainItem._id,
              descriptionId: mainItem.descriptions?.[0]?._id ?? "",
            };
            return {
              ...a,
              selectedContent: def,
              selectedCampaignContentItem: def,
            };
          }

          return {
            ...a,
            selectedContent: null,
            selectedCampaignContentItem: null,
          };
        });

        if (!next.length) return state;

        const addedKeys = next.map((a) => getAccountKey(a));
        const prevMarked = state.recentlyAddedKeysByOption?.[optionIndex] ?? {};
        const marked = { ...prevMarked };
        addedKeys.forEach((k) => (marked[String(k)] = true));

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: [...prev, ...next],
          },
          recentlyAddedKeysByOption: {
            ...(state.recentlyAddedKeysByOption ?? {}),
            [optionIndex]: marked,
          },
        };
      });
    },
    setAccounts: (optionIndex, accounts) => {
      set((state) => ({
        accountsByOption: {
          ...state.accountsByOption,
          [optionIndex]: accounts,
        },
      }));
    },

    // removeAccount: (optionIndex, accountKey) => {
    //   set((state) => {
    //     const prev = state.accountsByOption[optionIndex] ?? [];
    //     const next = prev.filter((a) => getAccountKey(a) !== accountKey);
    //     if (next.length === prev.length) return state;
    //     return {
    //       accountsByOption: { ...state.accountsByOption, [optionIndex]: next },
    //     };
    //   });
    // },
    removeAccount: (optionIndex, accountKey) => {
      useUpdateCampaign.getState().markDirty();
      set((state) => {
        const prevAcc = state.accountsByOption[optionIndex] ?? [];
        const removed = prevAcc.find((a) => getAccountKey(a) === accountKey);
        if (!removed) return state;

        const nextAcc = prevAcc.filter((a) => getAccountKey(a) !== accountKey);
        if (nextAcc.length === prevAcc.length) return state;

        // группа удаляемого аккаунта
        const removedGroup = getGroupBySocial((removed as any).socialMedia);

        // остались ли аккаунты в этой группе после удаления?
        const stillHasGroup = nextAcc.some(
          (a) => getGroupBySocial((a as any).socialMedia) === removedGroup,
        );

        // если группа опустела — удаляем campaignContent этой группы
        let nextContent = state.contentByOption[optionIndex] ?? [];
        if (!stillHasGroup) {
          nextContent = nextContent.filter(
            (c) => c.socialMediaGroup !== removedGroup,
          );
        }

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: nextAcc,
          },
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: nextContent,
          },
        };
      });
    },
    clearOption: (optionIndex) => {
      set((state) => {
        const nextAcc = { ...state.accountsByOption };
        const nextContent = { ...state.contentByOption };
        delete nextAcc[optionIndex];
        delete nextContent[optionIndex];
        return { accountsByOption: nextAcc, contentByOption: nextContent };
      });
    },
  })),
);
