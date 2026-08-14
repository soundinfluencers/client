import { create } from "zustand";
import {
  getCampaign,
  getProposalCampaign,
  postAddProposalOption,
} from "@/api/client/campaign/campaign.api";
import { getCampaignDraft } from "@/api/client/campaign/draft.api";

import {
  toCampaignPageModelFromDraft,
  toCampaignPageModelFromProposal,
  toCampaignPageModelFromRegular,
} from "@/client-side/utils/getCampaign.utils";
import type {
  AddProposalOptionRequest,
  CreateProposalOptionResult,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";

export const useFetchCampaign = create<any>((set, get) => ({
  data: null,
  isLoading: false,

  setDraft: async (draftId: string) => {
    set({ data: null, isLoading: true });

    try {
      const data = await getCampaignDraft(draftId);
      const next = toCampaignPageModelFromDraft(data);

      set({ data: next });
      return next;
    } catch (error) {
      console.log(error);
      set({ data: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setProposalOption: async (campaignId: string, optionIndex: number) => {
    set({ isLoading: true });

    try {
      const { data } = await getProposalCampaign(campaignId, optionIndex);
      const payload = data.data;
      const next = toCampaignPageModelFromProposal(payload);

      set({ data: next });
      return next;
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setCampaign: async (campaignId: string) => {
    set({ data: null, isLoading: true });

    try {
      const { data: res } = await getCampaign(campaignId);
      const payload = (res as any).data ?? res;

      const next = toCampaignPageModelFromRegular(payload);

      set({ data: next });
      return next;
    } catch (error) {
      console.log(error);
      set({ data: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  addProposalOption: async (
    campaignId: string,
    inheritFromCurrentOption: boolean,
  ): Promise<CreateProposalOptionResult> => {
    const data = get().data;
    if (!data || data.kind !== "proposal") {
      throw new Error("Proposal data is missing");
    }

    const base = data;

    const body: AddProposalOptionRequest = inheritFromCurrentOption
        ? {
          campaignName: base.campaignName,
          addedAccounts: base.selectedOption.addedAccounts.map((a: any) => ({
            ...(a.bundleId ? { bundleId: String(a.bundleId) } : {}),
            socialAccountId: a.socialAccountId,
            influencerId: a.influencerId,
            socialMedia: a.socialMedia,
            username: a.username,
            selectedCampaignContentItem: a.selectedContent
                ? {
                  campaignContentItemId: a.selectedContent.campaignContentItemId,
                  descriptionId: a.selectedContent.descriptionId,
                }
                : undefined,
            dateRequest: a.dateRequest,
          })),
          campaignContent: base.selectedOption.campaignContent.map((c: any) => ({
            _id: c._id,
            socialMedia: c.socialMedia,
            socialMediaGroup: c.socialMediaGroup,
            mainLink: c.mainLink,
            descriptions: (c.descriptions ?? []).map((d: any) => ({
              _id: d._id,
              description: d.description,
            })),
            taggedUser: c.taggedUser,
            taggedLink: c.taggedLink,
            additionalBrief: c.additionalBrief,
          })),
          socialMedia: base.socialMedia,
          campaignPrice: base.selectedOption.price,
          displayCurrency: base.selectedOption.displayCurrency,
          ...(base.selectedOption.selectedOffer
            ? {
              selectedOffer: {
                offerId: base.selectedOption.selectedOffer.offerId,
                selectedAccountIds:
                  base.selectedOption.selectedOffer.selectedAccountIds,
              },
            }
            : {}),
          paymentType: "",
        }
        : {
          campaignName: base.campaignName,
          addedAccounts: [],
          campaignContent: [],
          socialMedia: base.socialMedia,
          campaignPrice: base.selectedOption.price,
          displayCurrency: base.selectedOption.displayCurrency,
          paymentType: "",
        };

    set({ isLoading: true });

    try {
      return await postAddProposalOption(campaignId, body);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
