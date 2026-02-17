import { updateProfile } from "@/api/client/profile/profile.api";
import { useRefreshMe } from "@/pages/influencer/shared/hooks/useRefreshMe";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (payload: any) => updateProfile(payload),

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profileDetails"] });
      await refreshMe();
    },
  });
};
