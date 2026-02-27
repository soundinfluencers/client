import type { ISignupInfluencerDraft } from "@/types/user/influencer.types";

export type PersonalDetailsValues = Pick<
  ISignupInfluencerDraft,
  "firstName" | "lastName" | "email" | "phone" | "password"
>;