import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";

export const getAccountKey = (n: CampaignAddedAccount) =>
  String((n as any).addedAccountsId ?? (n as any).accountId);

type CampaignContentItem = {
  _id: string;
  socialMediaGroup: "main" | "music" | "press";
  descriptions?: Array<{ _id: string }>;
};

type ProposalAccountsStore = {
  accountsByOption: Record<number, CampaignAddedAccount[]>;
  contentByOption: Record<number, CampaignContentItem[]>;

  initOption: (
    optionIndex: number,
    serverAccounts: CampaignAddedAccount[],
    serverContent: any[],
    opts?: { force?: boolean }, // ✅
  ) => void;

  addAccounts: (optionIndex: number, accounts: CampaignAddedAccount[]) => void;

  mergeContent: (optionIndex: number, contentToAdd: any[]) => void;
  setAccountDateRequest: (
    optionIndex: number,
    accountKey: string,
    dateRequest: string,
  ) => void;
  removeAccount: (optionIndex: number, accountKey: string) => void;
  setAccounts: (optionIndex: number, accounts: CampaignAddedAccount[]) => void;
  clearOption: (optionIndex: number) => void;
};

export const useProposalAccountsStore = create<ProposalAccountsStore>()(
  devtools((set) => ({
    accountsByOption: {},
    contentByOption: {},

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
    mergeContent: (optionIndex, contentToAdd) => {
      set((state) => {
        const prev = state.contentByOption[optionIndex] ?? [];
        const incoming = contentToAdd ?? [];

        const map = new Map<string, any>();
        [...prev, ...incoming].forEach((it) => {
          if (!it) return;
          const key = String(
            it._id ?? `${it.socialMedia}-${it.mainLink ?? ""}`,
          );
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

    addAccounts: (optionIndex, accounts) => {
      set((state: any) => {
        const prev = state.accountsByOption[optionIndex] ?? [];
        const prevKeys = new Set(prev.map(getAccountKey));

        const content = state.contentByOption[optionIndex] ?? [];
        const mainItem = content.find((c) => c.socialMediaGroup === "main");

        const next = (accounts ?? [])
          .filter((a) => !prevKeys.has(getAccountKey(a)))
          .map((a) => {
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

        return {
          accountsByOption: {
            ...state.accountsByOption,
            [optionIndex]: [...prev, ...next],
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
