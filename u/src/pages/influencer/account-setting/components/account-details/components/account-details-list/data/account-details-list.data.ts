import type { AccountDetailsField } from "../types/account-details-list.types";

export const ACCOUNT_DETAILS_FIELDS = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  // { key: "profilePhotoUrl", label: "Photo profile", type: "avatar" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone number", type: "text" },
  // { key: "telegramUsername", label: "Telegram", type: "text" },
  { key: "password", label: "Password", type: "password" },
] satisfies readonly AccountDetailsField[];