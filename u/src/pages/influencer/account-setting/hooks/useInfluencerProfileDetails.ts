import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "./query-keys";
import { updateInfluencerProfileDetails } from "@/api/influencer/profile/influencer-profile.api";
import { handleApiError } from "@/api/error.api.ts";
import { toast } from "react-toastify";
import { useRefreshMe } from "@/pages/influencer/shared/hooks/useRefreshMe.ts";

export const useUpdateInfluencerDetails = () => {
  const qc = useQueryClient();
  const refreshMe = useRefreshMe();

  return useMutation({
    mutationFn: updateInfluencerProfileDetails,
    onSuccess: async (res) => {
      // qc.invalidateQueries({ queryKey: qk.influencerProfile });
      qc.setQueryData(qk.influencerProfile, (old) => {
        if (!old) return old;
        console.log(old);

        return { ...old, ...res };
      });
      await refreshMe();
      toast.success('Influencer profile details updated successfully');
    },
    onError: handleApiError,
  });
};