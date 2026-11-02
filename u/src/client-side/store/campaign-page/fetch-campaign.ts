import { create } from "zustand";
import {
  getCampaign,
  getProposalCampaign,
} from "@/api/client/campaign/campaign.api";
import { getCampaignDraft } from "@/api/client/campaign/draft.api";

import {
  toCampaignPageModelFromDraft,
  toCampaignPageModelFromProposal,
  toCampaignPageModelFromRegular,
} from "@/client-side/utils/getCampaign.utils";

// A single data slot: only its latest request may publish data/loading/error.
let latestRequest = 0;
const deletedProposals = new Set<string>();

export const useFetchCampaign = create<any>((set, get) => ({
  isProposalDeleted: (id: string) => deletedProposals.has(id),
  forgetProposal: (id: string) => {
    deletedProposals.add(id);
    if (get().requestKey?.startsWith(`proposal:${id}:`)) {
      set({ requestVersion: ++latestRequest, data: null, dataKey: null, requestKey: null, isLoading: false, error: null });
    }
  },
  requestVersion: 0,
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
      isLoading: true, error: null, requestKey, requestVersion: requestId,
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

  setProposalOption: async (campaignId: string, optionIndex: number, isOwnerCurrent = () => true) => {
    if (deletedProposals.has(campaignId)) return null;
    const requestId = ++latestRequest;
    const requestKey = `proposal:${campaignId}:${optionIndex}`;
    set({
      data: get().dataKey === requestKey ? get().data : null,
      isLoading: true, error: null, requestKey, requestVersion: requestId,
    });

    try {
      const { data } = await getProposalCampaign(campaignId, optionIndex);
      if (requestId !== latestRequest || deletedProposals.has(campaignId) || !isOwnerCurrent()) return null;
      const payload = (data as any).data ?? data;
      if (payload?.campaignId !== campaignId || payload?.selectedOption?.optionIndex !== optionIndex) throw new Error("Proposal response identity does not match the requested option.");
      const next = toCampaignPageModelFromProposal(payload);

      set({ data: next, dataKey: requestKey });
      return next;
    } catch (error) {
      if (requestId !== latestRequest || deletedProposals.has(campaignId) || !isOwnerCurrent()) return null;
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
      isLoading: true, error: null, requestKey, requestVersion: requestId,
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

}));
