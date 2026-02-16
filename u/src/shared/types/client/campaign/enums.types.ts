export type CampaignBackendStatus =
  | "work"
  | "pending"
  | "distributing"
  | "completed"
  | string;

export type SocialMedia =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "soundcloud"
  | string;

export type SocialMediaGroup = "main" | "music" | "press" | string;

export type ConfirmationStatus = "accept" | "wait" | "reject" | string;
export type ClosePromo = "close" | "open" | "wait" | string;

/** Сейчас API шлёт "ASAP" и т.п. */
export type DateRequest = string;

/** Если реально нужен отдельно UI-статус */
export type CampaignStatusUI =
  | "distributing"
  | "completed"
  | "pending"
  | "under_review"
  | "proposal";
