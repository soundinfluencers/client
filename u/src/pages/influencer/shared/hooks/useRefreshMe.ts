import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/store/get-user";
import { useCallback } from "react";
import { getMe } from "@/api/auth/auth.api.ts";

export const useRefreshMe = () => {
  const qc = useQueryClient();
  const patchUser = useUser((state) => state.patchUser);

  return useCallback(async () => {
    const me = await qc.fetchQuery({
      queryKey: ["get-me"],
      queryFn: getMe,
    });

    qc.setQueryData(["get-me"], me);
    patchUser(me);

    return me;
  }, [qc, patchUser]);
};