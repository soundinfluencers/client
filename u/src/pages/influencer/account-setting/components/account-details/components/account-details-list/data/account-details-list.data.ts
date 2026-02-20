import type { AccountDetailsField } from "../types/account-details-list.types";

export const ACCOUNT_DETAILS_FIELDS = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  { key: "logoUrl", label: "Photo profile", type: "avatar" },
  { key: "phone", label: "Phone number", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "password", label: "Password", type: "password" },
  // { key: "telegramUsername", label: "Telegram", type: "text" },
] satisfies readonly AccountDetailsField[];