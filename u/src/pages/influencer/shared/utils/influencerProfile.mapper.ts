import type { InfluencerProfileApi, TSocialAccounts, TSocialAccountShort } from "@/types/user/influencer.types";

export const normalizeProfileLists = (p: InfluencerProfileApi): InfluencerProfileApi => ({
  ...p,
  instagram: p.instagram ?? [],
  tiktok: p.tiktok ?? [],
  youtube: p.youtube ?? [],
  facebook: p.facebook ?? [],
  spotify: p.spotify ?? [],
  soundcloud: p.soundcloud ?? [],
  press: p.press ?? [],
});

export const updateProfilePlatformList = (
  profile: InfluencerProfileApi,
  platform: TSocialAccounts,
  updater: (list: TSocialAccountShort[]) => TSocialAccountShort[],
): InfluencerProfileApi => {
  return {
    ...profile,
    [platform]: updater(profile[platform] ?? []),
  };
};
