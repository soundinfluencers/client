import type { InfluencerProfileApi } from "@/types/user/influencer.types.ts";

export const getDefaultFormValues = (user: InfluencerProfileApi | undefined) => {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    logoUrl: user?.logoUrl ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    telegramUsername: user?.telegramUsername ?? '',
  };
};