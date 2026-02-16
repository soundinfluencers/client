import { create } from "zustand";
import {
  getCampaign,
  getProposalCampaign,
  patchAddProposalOption,
  postAddProposalOption,
} from "@/api/client/campaign/campaign.api";
import { getCampaignDraft } from "@/api/client/campaign/draft.api";

import {
  toCampaignPageModelFromDraft,
  toCampaignPageModelFromProposal,
  toCampaignPageModelFromRegular,
} from "./utils/getCampaign.utils";

import type { CampaignFetchState } from "@/pages/client/types";

export const useFetchCampaign = create<CampaignFetchState>((set, get) => ({
  data: null,
  isLoading: false,
  setDraft: async (draftId) => {
    set({ data: null });
    try {
      const { data: res } = await getCampaignDraft(draftId);

      const payload = (res as any).data ?? res;
      set({ data: toCampaignPageModelFromDraft(payload) });
    } catch (error) {
      console.log(error);
      set({ data: null });
    }
  },

  setProposalOption: async (campaignId, optionIndex) => {
    set({ isLoading: true });
    try {
      const { data } = await getProposalCampaign(campaignId, optionIndex);
      console.log(data, "proposal-campaign");

      const payload = (data as any).data ?? data;

      const next = toCampaignPageModelFromProposal(payload);
      set({ data: next });
    } finally {
      set({ isLoading: false });
    }
  },
  addProposalOption: async (campaignId, inheritFromOption0) => {
    const data = get().data;
    if (!data || data.kind !== "proposal") return null;
    const base = data;
    const body = inheritFromOption0
      ? {
          campaignName: base.campaignName,
          addedAccounts: base.selectedOption.addedAccounts.map((a) => ({
            socialAccountId: a.socialAccountId,
            influencerId: a.influencerId,
            socialMedia: a.socialMedia,
            username: a.username,
            selectedCampaignContentItem: a.selectedContent
              ? {
                  campaignContentItemId:
                    a.selectedContent.campaignContentItemId,
                  descriptionId: a.selectedContent.descriptionId,
                }
              : undefined,
            dateRequest: a.dateRequest,
          })),
          campaignContent: base.selectedOption.campaignContent.map((c) => ({
            _id: c._id,
            socialMedia: c.socialMedia,
            socialMediaGroup: c.socialMediaGroup,
            mainLink: c.mainLink,
            descriptions: (c.descriptions ?? []).map((d) => ({
              _id: d._id,
              description: d.description,
            })),
            taggedUser: c.taggedUser,
            taggedLink: c.taggedLink,
            additionalBrief: c.additionalBrief,
          })),
          socialMedia: base.socialMedia,
          campaignPrice: base?.price ?? 0,
          paymentType: "",
        }
      : {
          campaignName: base.campaignName,
          addedAccounts: [],
          campaignContent: [],
          socialMedia: base.socialMedia,
          campaignPrice: base?.price ?? 0,
          paymentType: "",
        };
    set({ isLoading: true });
    try {
      await postAddProposalOption(campaignId, body);
      console.log(data, "awdlwlwlwwlwl");
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  setCampaign: async (campaignId) => {
    set({ data: null });
    try {
      const { data: res } = await getCampaign(campaignId);
      const payload = (res as any).data ?? res;
      set({ data: toCampaignPageModelFromRegular(payload) });
    } catch (error) {
      console.log(error);
      set({ data: null });
    }
  },
}));
