import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "./query-keys";
import { updateInfluencerProfileDetails } from "@/api/influencer/profile/influencer-profile.api";

export const useUpdateInfluencerDetails = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateInfluencerProfileDetails,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.influencerProfile });
    },
  });
};