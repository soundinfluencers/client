import { fetchProfileDetails } from "@/api/client/profile/profile.api";
import { useQuery } from "@tanstack/react-query";

export const useProfileDetailsQuery = () => {
  return useQuery({
    queryKey: ["profileDetails"],
    queryFn: fetchProfileDetails,
    staleTime: 60_000,
  });
};
