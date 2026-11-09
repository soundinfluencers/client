import type { ConnectedAccount } from "@/client-side/types/offers";
import { getProposalWorkingRowKey, removeProposalGroup, type ProposalOptionSnapshot } from "@/client-side/utils/proposal-option-patch";
import { BUNDLES_AVAILABLE } from "@/shared/config/bundle-availability";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import { ObjectId } from "bson";
import { useUpdateCampaign } from "@/client-side/store";

export const getAccountKey = (n: { addedAccountsId?: string; accountId?: string; socialAccountId?: string; _id?: string }) =>
    String(
        getProposalWorkingRowKey(n) || (
        (n as any).addedAccountsId ??
        (n as any).accountId ??
        (n as any).socialAccountId ??
        (n as any)._id ??
        ""),
    );
const oid = () => new ObjectId().toHexString();

// type CampaignContentItem = {
//   _id: string;
//   socialMediaGroup: "main" | "music" | "press";
//   descriptions?: Array<{ _id: string }>;
//   socialMedia?: string;
// };
type CampaignContentItem = {
  profileType?: "community" | "creator";
  _id: string;
  socialMedia: string;
  socialMediaGroup: "main" | "music" | "press";
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: Array<{ _id: string; additionalBrief: string }>;
  descriptions: Array<{
    _id: string;
    description: string;
  }>;
};
type ProposalAccountsStore = {
  offerPreviewByOption: Record<number, any>;
  optionSnapshotsByIndex: Record<number, ProposalOptionSnapshot>;
  selectedOfferChangeByOption: Record<number, any>;
  restoreOptionFromSnapshot: (index: number) => boolean;
  removeOfferBundleOverlap: (index: number, key: string) => void;
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
    opts?: { force?: boolean; snapshot?: ProposalOptionSnapshot },
  ) => void;
  addContentForSocial: (
      optionIndex: number,
      socialMedia: string,
      payload: { mainLink: string },
      inheritFromContentId?: string,
      targetAccountKey?: string,
  ) => {
    contentId: string;
    firstDescriptionId: string;
  };
  addAccounts: (optionIndex: number, accounts: (CampaignAddedAccount | ConnectedAccount)[]) => void;
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
        additionalBriefId?: string;
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
  devtools((set, get) => ({
    optionSnapshotsByIndex: {}, selectedOfferChangeByOption: {}, offerPreviewByOption: {},
    restoreOptionFromSnapshot: (index) => {
      const snapshot = get().optionSnapshotsByIndex[index]; if (!snapshot) return false;
      get().initOption(index, structuredClone(snapshot.addedAccounts), structuredClone(snapshot.campaignContent), { force: true, snapshot });
      return true;
    },
    removeOfferBundleOverlap: (index, key) => {
      if (!BUNDLES_AVAILABLE) return;
      const state = get(); const snapshot = state.optionSnapshotsByIndex[index];
      if (!snapshot?.canEdit) return;
      const result = removeProposalGroup(snapshot, state.accountsByOption[index] ?? [], key, true);
      useUpdateCampaign.getState().markDirty();
      set({ accountsByOption: { ...state.accountsByOption, [index]: result.accounts }, selectedOfferChangeByOption: { ...state.selectedOfferChangeByOption, [index]: null } });
    },
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
          optionSnapshotsByIndex: {}, selectedOfferChangeByOption: {}, offerPreviewByOption: {},
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
        if (exists && !opts?.force) return opts?.snapshot ? { optionSnapshotsByIndex: { ...state.optionSnapshotsByIndex, [optionIndex]: structuredClone(opts.snapshot) } } : state;

        const normalizedContent = (serverContent ?? []).map((item: any) => ({
          profileType: item.profileType,
          _id: String(item?._id ?? oid()),
          socialMedia: String(item?.socialMedia ?? "").toLowerCase(),
          socialMediaGroup: item?.socialMediaGroup ?? getGroupBySocial(item?.socialMedia),
          mainLink: String(item?.mainLink ?? ""),
          taggedUser: String(item?.taggedUser ?? ""),
          taggedLink: String(item?.taggedLink ?? ""),
          additionalBrief: (Array.isArray(item?.additionalBrief)
              ? item.additionalBrief
              : String(item?.additionalBrief ?? "").trim()
                ? [{ additionalBrief: String(item.additionalBrief) }]
                : []
          ).map((brief: any) => ({
            _id: String(brief?._id ?? oid()),
            additionalBrief: String(brief?.additionalBrief ?? ""),
          })),
          descriptions: Array.isArray(item?.descriptions)
              ? item.descriptions.map((desc: any) => ({
                _id: String(desc?._id ?? oid()),
                description: String(desc?.description ?? ""),
              }))
              : [],
        }));

        const snapshots = { ...state.optionSnapshotsByIndex };
        const changes = { ...state.selectedOfferChangeByOption };
        const previews = { ...state.offerPreviewByOption };
        if (opts?.snapshot) {
          snapshots[optionIndex] = structuredClone({ ...opts.snapshot, addedAccounts: serverAccounts, campaignContent: normalizedContent });
          delete changes[optionIndex];
          delete previews[optionIndex];
        }
        return {
          optionSnapshotsByIndex: snapshots,
          selectedOfferChangeByOption: changes,
          offerPreviewByOption: previews,
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: serverAccounts ?? [],
          },
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: normalizedContent,
          },
        };
      });
    },
    setAccountDateRequest: (optionIndex, accountKey, dateRequest) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const prev = state.accountsByOption[optionIndex] ?? [];

        const next = prev.map((account) =>
            String(getAccountKey(account)) === String(accountKey)
                ? { ...account, dateRequest }
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
    addContentForSocial: (
        optionIndex,
        socialMedia,
        payload,
        inheritFromContentId,
        targetAccountKey,
    ) => {
      const state = get();
      const sm = String(socialMedia ?? "").toLowerCase();
      const target = targetAccountKey ? state.accountsByOption[optionIndex]?.find(row => getAccountKey(row) === targetAccountKey) : undefined;
      if (targetAccountKey && (!target || String(target.socialMedia).toLowerCase() !== sm)) throw new Error("The placement changed. Reopen its content editor.");
      const source = inheritFromContentId ? state.contentByOption[optionIndex]?.find(item => item._id === inheritFromContentId) : undefined;
      const profileType = (target as any)?.profileType ?? source?.profileType ?? "community";
      if (source && (source.profileType ?? "community") !== profileType) throw new Error("The selected content does not match this placement's profile.");
      const newId = oid(), firstDescriptionId = oid();
      const selected = { campaignContentItemId: newId, descriptionId: firstDescriptionId };
      const item: CampaignContentItem = { _id: newId, socialMedia: sm, socialMediaGroup: getGroupBySocial(sm), profileType,
        mainLink: payload.mainLink, taggedUser: "", taggedLink: "", additionalBrief: [],
        descriptions: [{ _id: firstDescriptionId, description: "" }] };
      useUpdateCampaign.getState().markDirty();
      // One store publication: a target row never points outside working content.
      set(current => ({
        contentByOption: { ...current.contentByOption, [optionIndex]: [...(current.contentByOption[optionIndex] ?? []), item] },
        ...(targetAccountKey ? { accountsByOption: { ...current.accountsByOption, [optionIndex]: current.accountsByOption[optionIndex].map(row => {
          if (getAccountKey(row) !== targetAccountKey) return row;
          const { selectedContentItem: _display, ...rest } = row as any;
          return { ...rest, selectedContent: selected, selectedCampaignContentItem: selected };
        }) } } : {}),
      }));
      return { contentId: newId, firstDescriptionId };
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

        const incoming = (contentToAdd ?? []).map((item: any) => ({
          _id: String(item?._id ?? oid()),
          socialMedia: String(item?.socialMedia ?? "").toLowerCase(),
          socialMediaGroup: item?.socialMediaGroup ?? getGroupBySocial(item?.socialMedia),
          mainLink: String(item?.mainLink ?? ""),
          taggedUser: String(item?.taggedUser ?? ""),
          taggedLink: String(item?.taggedLink ?? ""),
          additionalBrief: (Array.isArray(item?.additionalBrief)
              ? item.additionalBrief
              : String(item?.additionalBrief ?? "").trim()
                ? [{ additionalBrief: String(item.additionalBrief) }]
                : []
          ).map((brief: any) => ({
            _id: String(brief?._id ?? oid()),
            additionalBrief: String(brief?.additionalBrief ?? ""),
          })),
          descriptions: Array.isArray(item?.descriptions)
              ? item.descriptions.map((desc: any) => ({
                _id: String(desc?._id ?? oid()),
                description: String(desc?.description ?? ""),
              }))
              : [],
        }));

        const map = new Map<string, CampaignContentItem>();

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

    //     const content: CampaignContentItem[] = state.contentByOption[optionIndex] ?? [];
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

        const content: CampaignContentItem[] = state.contentByOption[optionIndex] ?? [];

        const addedRaw = (accounts ?? []).filter((account) => {
          const key = getAccountKey(account);

          if (!key) {
            console.warn("[PROPOSAL addAccounts] account without key", account);
            return false;
          }

          return !prevKeys.has(key);
        });

        const next = addedRaw.map((account) => {
          const accountId = String(
              (account as any).accountId ??
              (account as any).socialAccountId ??
              "",
          );

          const socialAccountId = String(
              (account as any).socialAccountId ??
              (account as any).accountId ??
              "",
          );

          const sm = String((account as any).socialMedia ?? "").toLowerCase();
          const group = getGroupBySocial(sm);

          const contentItem =
              content.find(
                  (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
              ) ??
              content.find((item) => item.socialMediaGroup === group) ??
              null;

          const selected = contentItem
              ? {
                campaignContentItemId: contentItem._id,
                descriptionId: contentItem.descriptions?.[0]?._id ?? "",
              }
              : null;

          const selectedContent =
              (account as any).selectedContent ??
              (account as any).selectedCampaignContentItem ??
              selected;

          return {
            ...account,

            accountId,
            socialAccountId,

            socialMedia: sm,

            price: Number((account as any).price ?? (account as any).publicPrice ?? 0),
            publicPrice: Number((account as any).publicPrice ?? (account as any).price ?? 0),

            followers: Number((account as any).followers ?? 0),

            logoUrl: String((account as any).logoUrl ?? ""),
            countries: Array.isArray((account as any).countries)
                ? (account as any).countries
                : [],
            genres: Array.isArray((account as any).genres)
                ? (account as any).genres
                : [],

            dateRequest: (account as any).dateRequest ?? "ASAP",

            selectedContent,
            selectedCampaignContentItem: selectedContent,

            confirmation: (account as any).confirmation ?? "wait",
            closePromo: (account as any).closePromo ?? "wait",
          };
        });

        if (!next.length) return state;

        const addedKeys = next.map(getAccountKey).filter(Boolean);

        const prevMarked = state.recentlyAddedKeysByOption?.[optionIndex] ?? {};
        const marked = { ...prevMarked };

        addedKeys.forEach((key) => {
          marked[String(key)] = true;
        });

        console.log("[PROPOSAL addAccounts] next normalized", next);

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
      const state = get(); const snapshot = state.optionSnapshotsByIndex[optionIndex];
      if (!snapshot?.canEdit) return;
      if (!BUNDLES_AVAILABLE && ((snapshot.addedBundles?.length ?? 0) || snapshot.addedAccounts.some((a) => a.bundleId || a.campaignBundleId))) return;
      const effective = { ...snapshot, selectedOffer: Object.hasOwn(state.selectedOfferChangeByOption, optionIndex) ? state.selectedOfferChangeByOption[optionIndex] : snapshot.selectedOffer };
        const result = removeProposalGroup(effective, state.accountsByOption[optionIndex] ?? [], accountKey, false, Object.hasOwn(state.selectedOfferChangeByOption, optionIndex));
      if (!result.accounts.length) return;
      useUpdateCampaign.getState().markDirty();
      set({ accountsByOption: { ...state.accountsByOption, [optionIndex]: result.accounts },
          ...(result.selectedOfferChange === null ? { offerPreviewByOption: { ...state.offerPreviewByOption, [optionIndex]: null } } : {}),
        selectedOfferChangeByOption: result.selectedOfferChange === null ? { ...state.selectedOfferChangeByOption, [optionIndex]: null } : state.selectedOfferChangeByOption });
    },
    clearOption: (optionIndex) => {
      set((state) => {
        const nextAcc = { ...state.accountsByOption };
        const nextContent = { ...state.contentByOption };
        delete nextAcc[optionIndex];
        delete nextContent[optionIndex];
          const previews = { ...state.offerPreviewByOption }; delete previews[optionIndex];
          return { accountsByOption: nextAcc, contentByOption: nextContent, offerPreviewByOption: previews };
      });
    },
  })),
);
