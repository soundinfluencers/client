import { useMutation } from "@tanstack/react-query";
import { getShareLink } from "@/api/client/campaign/campaign.api";
import { copyToClipboard } from "../utils";

export const useCopyShareLinkMutation = () => {
  return useMutation({
    mutationKey: ["copyShareLink"],
    mutationFn: async (campaignId: string) => {
      const { data } = await getShareLink(campaignId);

      const link = await copyToClipboard(data?.shareLink);

      return link;
    },
  });
};
