import { getInfluencerProfile } from "@/api/influencer/profile/influencer-profile.api";
import { useQuery } from "@tanstack/react-query";
import { qk } from "./query-keys";
import { normalizeProfileLists } from "../../shared/utils/influencerProfile.mapper";

export const useInfluencerProfileQuery = () => {
  return useQuery({
    queryKey: qk.influencerProfile,
    queryFn: async () => normalizeProfileLists(await getInfluencerProfile()),
    staleTime: 30_000, // 30 seconds (mb adjust based on how often profile data changes or disable invalidation if data is relatively static)
  });
};