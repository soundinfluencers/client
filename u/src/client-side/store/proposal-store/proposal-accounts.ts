import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import { ObjectId } from "bson";
import {useUpdateCampaign} from "@/client-side/store";
import type {
  ProposalOptionDto,
  ProposalSelectedOfferInput,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import {
  removeFullOverlapAccounts,
  type FullOfferBundleOverlap,
} from "@/client-side/widgets/campaign/model/proposal-overlap-removal";

type PendingBundleMembership = Record<string, string[]>;

export const getAccountKey = (n: CampaignAddedAccount) =>
    String(
        (n as any).addedAccountsId ??
        (n as any).accountId ??
        (n as any).socialAccountId ??
        (n as any)._id ??
        "",
    );
const oid = () => new ObjectId().toHexString();

// type CampaignContentItem = {
//   _id: string;
//   socialMediaGroup: "main" | "music" | "press";
//   descriptions?: Array<{ _id: string }>;
//   socialMedia?: string;
// };
type CampaignContentItem = {
  _id: string;
  socialMedia: string;
  socialMediaGroup: "main" | "music" | "press";
  mainLink: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  descriptions: Array<{
    _id: string;
    description: string;
  }>;
};
type ProposalAccountsStore = {
  optionSnapshotsByIndex: Record<number, ProposalOptionDto>;
  accountsByOption: Record<number, CampaignAddedAccount[]>;
  contentByOption: Record<number, CampaignContentItem[]>;
  pendingBundleMembershipByOption: Record<number, PendingBundleMembership>;
  selectedOfferChangeByOption: Record<
    number,
    ProposalSelectedOfferInput | null
  >;
  setOptionSnapshot: (option: ProposalOptionDto) => void;
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
  setPendingTopology: (
    optionIndex: number,
    topology: {
      bundles: PendingBundleMembership;
      selectedOffer?: ProposalSelectedOfferInput;
    },
  ) => void;
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
  removeOfferBundleOverlap: (
    optionIndex: number,
    overlap: FullOfferBundleOverlap,
  ) => void;
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
    optionSnapshotsByIndex: {},
    accountsByOption: {},
    contentByOption: {},
    pendingBundleMembershipByOption: {},
    selectedOfferChangeByOption: {},
    recentlyAddedKeysByOption: {},
    pendingDeleteKeysByOption: {},
    currentCampaignId: null,
    setCurrentCampaignId: (id) => set({ currentCampaignId: id }),
    setOptionSnapshot: (option) => {
      set((state) => ({
        optionSnapshotsByIndex: {
          ...state.optionSnapshotsByIndex,
          [option.optionIndex]: option,
        },
      }));
    },
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
          optionSnapshotsByIndex: {},
          accountsByOption: {},
          contentByOption: {},
          pendingBundleMembershipByOption: {},
          selectedOfferChangeByOption: {},
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
        ) as CampaignAddedAccount[];

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

        const normalizedContent = (serverContent ?? []).map((item: any) => ({
          _id: String(item?._id ?? oid()),
          socialMedia: String(item?.socialMedia ?? "").toLowerCase(),
          socialMediaGroup: item?.socialMediaGroup ?? getGroupBySocial(item?.socialMedia),
          mainLink: String(item?.mainLink ?? ""),
          taggedUser: String(item?.taggedUser ?? ""),
          taggedLink: String(item?.taggedLink ?? ""),
          additionalBrief: String(item?.additionalBrief ?? ""),
          descriptions: Array.isArray(item?.descriptions)
              ? item.descriptions.map((desc: any) => ({
                _id: String(desc?._id ?? oid()),
                description: String(desc?.description ?? ""),
              }))
              : [],
        }));

        const pendingBundleMembershipByOption = {
          ...state.pendingBundleMembershipByOption,
        };
        const selectedOfferChangeByOption = {
          ...state.selectedOfferChangeByOption,
        };
        const recentlyAddedKeysByOption = {
          ...state.recentlyAddedKeysByOption,
        };
        const pendingDeleteKeysByOption = {
          ...state.pendingDeleteKeysByOption,
        };

        if (opts?.force) {
          delete pendingBundleMembershipByOption[optionIndex];
          delete selectedOfferChangeByOption[optionIndex];
          delete recentlyAddedKeysByOption[optionIndex];
          delete pendingDeleteKeysByOption[optionIndex];
        }

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: serverAccounts ?? [],
          },
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: normalizedContent,
          },
          pendingBundleMembershipByOption,
          selectedOfferChangeByOption,
          recentlyAddedKeysByOption,
          pendingDeleteKeysByOption,
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

        const incoming = (contentToAdd ?? []).map((item: any) => ({
          _id: String(item?._id ?? oid()),
          socialMedia: String(item?.socialMedia ?? "").toLowerCase(),
          socialMediaGroup: item?.socialMediaGroup ?? getGroupBySocial(item?.socialMedia),
          mainLink: String(item?.mainLink ?? ""),
          taggedUser: String(item?.taggedUser ?? ""),
          taggedLink: String(item?.taggedLink ?? ""),
          additionalBrief: String(item?.additionalBrief ?? ""),
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
    setPendingTopology: (optionIndex, topology) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const snapshot = state.optionSnapshotsByIndex[optionIndex];
        let accounts = state.accountsByOption[optionIndex] ?? [];

        if (topology.selectedOffer && snapshot?.selectedOffer) {
          const nextOfferAccountIds = new Set(
            topology.selectedOffer.selectedAccountIds.map(String),
          );
          const persistedOfferAccountIds = new Set(
            snapshot.selectedOffer.selectedAccountIds.map(String),
          );

          accounts = accounts.filter((account) => {
            const socialAccountId = String(
              (account as any).socialAccountId ??
              (account as any).accountId ??
              "",
            );

            if (!persistedOfferAccountIds.has(socialAccountId)) return true;
            if (nextOfferAccountIds.has(socialAccountId)) return true;

            return Boolean((account as any).bundleId);
          });
        }

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: accounts,
          },
          pendingBundleMembershipByOption: {
            ...state.pendingBundleMembershipByOption,
            [optionIndex]: topology.bundles,
          },
          ...(topology.selectedOffer
            ? {
              selectedOfferChangeByOption: {
                ...state.selectedOfferChangeByOption,
                [optionIndex]: topology.selectedOffer,
              },
            }
            : {}),
        };
      });
    },
    addAccounts: (optionIndex, accounts) => {
      set((state: any) => {
        useUpdateCampaign.getState().markDirty();

        const prev = state.accountsByOption[optionIndex] ?? [];
        const content = state.contentByOption[optionIndex] ?? [];
        const incomingBySocialId = new Map<string, CampaignAddedAccount>();

        (accounts ?? []).forEach((account) => {
          const socialAccountId = String(
            (account as any).socialAccountId ??
            (account as any).accountId ??
            "",
          );

          if (!socialAccountId) {
            return;
          }

          incomingBySocialId.set(socialAccountId, account);
        });

        const existingSocialIds = new Set(
          prev.map((account: CampaignAddedAccount) =>
            String(
              (account as any).socialAccountId ??
              (account as any).accountId ??
              "",
            ),
          ),
        );
        const addedRaw = [...incomingBySocialId.entries()]
          .filter(([socialAccountId]) => !existingSocialIds.has(socialAccountId))
          .map(([, account]) => account);

        const mergedExisting = prev.map((account: CampaignAddedAccount) => {
          const socialAccountId = String(
            (account as any).socialAccountId ??
            (account as any).accountId ??
            "",
          );
          const incoming = incomingBySocialId.get(socialAccountId) as any;
          const incomingBundleId = String(incoming?.bundleId ?? "").trim();

          if (!incoming || !incomingBundleId) return account;

          return {
            ...account,
            bundleId: incomingBundleId,
          };
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
                  (item: CampaignContentItem) =>
                    String(item.socialMedia ?? "").toLowerCase() === sm,
              ) ??
              content.find(
                (item: CampaignContentItem) => item.socialMediaGroup === group,
              ) ??
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

        const hasExistingBundleChanges = mergedExisting.some(
          (account: CampaignAddedAccount, index: number) =>
            (account as any).bundleId !== (prev[index] as any)?.bundleId,
        );

        if (!next.length && !hasExistingBundleChanges) return state;

        const addedKeys = next.map(getAccountKey).filter(Boolean);

        const prevMarked = state.recentlyAddedKeysByOption?.[optionIndex] ?? {};
        const marked = { ...prevMarked };

        addedKeys.forEach((key) => {
          marked[String(key)] = true;
        });

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: [...mergedExisting, ...next],
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

        const removed = prevAcc.find(
            (account) => String(getAccountKey(account)) === String(accountKey),
        );

        if (!removed) return state;

        const snapshot = state.optionSnapshotsByIndex[optionIndex];
        const pendingOffer = Object.prototype.hasOwnProperty.call(
          state.selectedOfferChangeByOption,
          optionIndex,
        )
          ? state.selectedOfferChangeByOption[optionIndex]
          : undefined;
        const effectiveOffer =
          pendingOffer === undefined ? snapshot?.selectedOffer : pendingOffer;
        const offerAccountIds = new Set(
          effectiveOffer?.selectedAccountIds?.map(String) ?? [],
        );
        const removedSocialAccountId = String(
          (removed as any).socialAccountId ??
          (removed as any).accountId ??
          "",
        );
        const removedBundleId = String((removed as any).bundleId ?? "").trim();
        const removesOffer =
          !removedBundleId && offerAccountIds.has(removedSocialAccountId);

        const nextAcc = prevAcc.flatMap((account) => {
          const socialAccountId = String(
            (account as any).socialAccountId ??
            (account as any).accountId ??
            "",
          );
          const bundleId = String((account as any).bundleId ?? "").trim();

          if (removedBundleId) {
            if (bundleId !== removedBundleId) return [account];

            if (offerAccountIds.has(socialAccountId)) {
              const next = { ...(account as any) };
              delete next.bundleId;
              delete next.campaignBundleId;
              delete next.bundlePosition;
              return [next as CampaignAddedAccount];
            }

            return [];
          }

          if (removesOffer) {
            if (!offerAccountIds.has(socialAccountId)) return [account];
            return bundleId ? [account] : [];
          }

          return String(getAccountKey(account)) === String(accountKey)
            ? []
            : [account];
        });

        if (nextAcc.length === prevAcc.length && !removedBundleId && !removesOffer) {
          return state;
        }

        const remainingGroups = new Set(
          nextAcc.map((account) =>
            getGroupBySocial((account as any).socialMedia),
          ),
        );
        const nextContent = (state.contentByOption[optionIndex] ?? []).filter(
          (content) => remainingGroups.has(content.socialMediaGroup),
        );

        const pendingDelete = {
          ...(state.pendingDeleteKeysByOption?.[optionIndex] ?? {}),
        };

        delete pendingDelete[String(accountKey)];

        const recentlyAdded = {
          ...(state.recentlyAddedKeysByOption?.[optionIndex] ?? {}),
        };

        delete recentlyAdded[String(accountKey)];

        const nextSelectedOfferChanges = {
          ...state.selectedOfferChangeByOption,
        };
        if (removesOffer) {
          nextSelectedOfferChanges[optionIndex] = null;
        }

        const nextBundleMembership = {
          ...(state.pendingBundleMembershipByOption[optionIndex] ?? {}),
        };
        if (removedBundleId) {
          delete nextBundleMembership[removedBundleId];
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
          pendingDeleteKeysByOption: {
            ...(state.pendingDeleteKeysByOption ?? {}),
            [optionIndex]: pendingDelete,
          },
          recentlyAddedKeysByOption: {
            ...(state.recentlyAddedKeysByOption ?? {}),
            [optionIndex]: recentlyAdded,
          },
          pendingBundleMembershipByOption: {
            ...state.pendingBundleMembershipByOption,
            [optionIndex]: nextBundleMembership,
          },
          selectedOfferChangeByOption: nextSelectedOfferChanges,
        };
      });
    },
    removeOfferBundleOverlap: (optionIndex, overlap) => {
      useUpdateCampaign.getState().markDirty();

      set((state) => {
        const previousAccounts = state.accountsByOption[optionIndex] ?? [];
        const nextAccounts = removeFullOverlapAccounts(
          previousAccounts,
          overlap,
        );

        if (nextAccounts.length === previousAccounts.length) return state;

        const remainingGroups = new Set(
          nextAccounts.map((account) =>
            getGroupBySocial((account as any).socialMedia),
          ),
        );
        const nextContent = (state.contentByOption[optionIndex] ?? []).filter(
          (content) => remainingGroups.has(content.socialMediaGroup),
        );
        const removedAccountKeys = new Set(
          previousAccounts
            .filter((account) => !nextAccounts.includes(account))
            .map(getAccountKey)
            .filter(Boolean),
        );
        const pendingDelete = {
          ...(state.pendingDeleteKeysByOption[optionIndex] ?? {}),
        };
        const recentlyAdded = {
          ...(state.recentlyAddedKeysByOption[optionIndex] ?? {}),
        };

        removedAccountKeys.forEach((key) => {
          delete pendingDelete[String(key)];
          delete recentlyAdded[String(key)];
        });

        const nextBundleMembership = {
          ...(state.pendingBundleMembershipByOption[optionIndex] ?? {}),
        };
        delete nextBundleMembership[overlap.bundleId];

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: nextAccounts,
          },
          contentByOption: {
            ...state.contentByOption,
            [optionIndex]: nextContent,
          },
          pendingDeleteKeysByOption: {
            ...state.pendingDeleteKeysByOption,
            [optionIndex]: pendingDelete,
          },
          recentlyAddedKeysByOption: {
            ...state.recentlyAddedKeysByOption,
            [optionIndex]: recentlyAdded,
          },
          pendingBundleMembershipByOption: {
            ...state.pendingBundleMembershipByOption,
            [optionIndex]: nextBundleMembership,
          },
          selectedOfferChangeByOption: {
            ...state.selectedOfferChangeByOption,
            [optionIndex]: null,
          },
        };
      });
    },
    clearOption: (optionIndex) => {
      set((state) => {
        const nextAcc = { ...state.accountsByOption };
        const nextContent = { ...state.contentByOption };
        const nextBundleMembership = {
          ...state.pendingBundleMembershipByOption,
        };
        const nextOfferChanges = { ...state.selectedOfferChangeByOption };
        delete nextAcc[optionIndex];
        delete nextContent[optionIndex];
        delete nextBundleMembership[optionIndex];
        delete nextOfferChanges[optionIndex];
        return {
          accountsByOption: nextAcc,
          contentByOption: nextContent,
          pendingBundleMembershipByOption: nextBundleMembership,
          selectedOfferChangeByOption: nextOfferChanges,
        };
      });
    },
  })),
);
