import type { InfluencerProfileApi } from "@/api/influencer/profile/influencer-profile.api";

export const getDefaultFormValues = (user: InfluencerProfileApi | null) => {
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profilePhotoUrl: user?.profilePhotoUrl || '',
    email: user?.email || '',
    phone: user?.phone || '',
    telegramUsername: user?.telegramUsername || '',
  };
};