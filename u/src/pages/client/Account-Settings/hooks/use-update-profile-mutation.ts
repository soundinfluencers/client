import { updateProfile } from "@/api/client/profile/profile.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (payload: any) => updateProfile(payload),

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profileDetails"] });
    },
  });
};
