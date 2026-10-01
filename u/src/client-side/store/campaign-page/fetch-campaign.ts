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

// A single data slot: only its latest request may publish data/loading/error.
let latestRequest = 0;

export const useFetchCampaign = create<any>((set, get) => ({
  data: null,
  dataKey: null,
  requestKey: null,
  isLoading: false,
  error: null,

  setDraft: async (draftId: string) => {
    const requestId = ++latestRequest;
    const requestKey = `draft:${draftId}`;
    set({
      data: get().dataKey === requestKey ? get().data : null,
      isLoading: true, error: null, requestKey,
    });

    try {
      const data = await getCampaignDraft(draftId);
      if (requestId !== latestRequest) return null;
      const next = toCampaignPageModelFromDraft(data);

      set({ data: next, dataKey: requestKey });
      return next;
    } catch (error) {
      if (requestId !== latestRequest) return null;
      console.log(error);
      set({ error });
      return null;
    } finally {
      if (requestId === latestRequest) set({ isLoading: false });
    }
  },

  setProposalOption: async (campaignId: string, optionIndex: number) => {
    const requestId = ++latestRequest;
    const requestKey = `proposal:${campaignId}:${optionIndex}`;
    set({
      data: get().dataKey === requestKey ? get().data : null,
      isLoading: true, error: null, requestKey,
    });

    try {
      const { data } = await getProposalCampaign(campaignId, optionIndex);
      if (requestId !== latestRequest) return null;
      const payload = (data as any).data ?? data;
      const next = toCampaignPageModelFromProposal(payload);

      set({ data: next, dataKey: requestKey });
      return next;
    } catch (error) {
      if (requestId !== latestRequest) return null;
      console.log(error);
      set({ error });
      return null;
    } finally {
      if (requestId === latestRequest) set({ isLoading: false });
    }
  },

  setCampaign: async (campaignId: string) => {
    const requestId = ++latestRequest;
    const requestKey = `regular:${campaignId}`;
    set({
      data: get().dataKey === requestKey ? get().data : null,
      isLoading: true, error: null, requestKey,
    });

    try {
      const { data: res } = await getCampaign(campaignId);
      if (requestId !== latestRequest) return null;
      const payload = (res as any).data ?? res;

      const next = toCampaignPageModelFromRegular(payload);

      set({ data: next, dataKey: requestKey });
      return next;
    } catch (error) {
      if (requestId !== latestRequest) return null;
      console.log(error);
      set({ error });
      return null;
    } finally {
      if (requestId === latestRequest) set({ isLoading: false });
    }
  },

  addProposalOption: async (campaignId: string, inheritFromOption0: boolean) => {
    const data = get().data;
    if (!data || data.kind !== "proposal") return null;

    const base = data;

    const body = inheritFromOption0
        ? {
          campaignName: base.campaignName,
          addedAccounts: base.selectedOption.addedAccounts.map((a: any) => ({
            socialAccountId: a.socialAccountId,
            influencerId: a.influencerId,
            socialMedia: a.socialMedia,
            username: a.username,
            selectedCampaignContentItem: a.selectedContent
                ? {
                  campaignContentItemId: a.selectedContent.campaignContentItemId,
                  descriptionId: a.selectedContent.descriptionId,
                  additionalBriefId: a.selectedContent.additionalBriefId,
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

    const requestId = ++latestRequest;
    set({ isLoading: true, error: null });

    try {
      await postAddProposalOption(campaignId, body);
      // A newer read can supersede UI ownership, but cannot undo a successful write.
      return true;
    } catch (error) {
      if (requestId !== latestRequest) return null;
      console.log(error);
      set({ error });
      return null;
    } finally {
      if (requestId === latestRequest) set({ isLoading: false });
    }
  },
}));
