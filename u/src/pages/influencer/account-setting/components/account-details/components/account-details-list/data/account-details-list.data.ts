import type { AccountDetailsField } from "../types/account-details-list.types";

export const ACCOUNT_DETAILS_FIELDS: AccountDetailsField[] = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  { key: "logosUrl", label: "Photo profile", type: "avatar" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone number", type: "text" },
  { key: "telegram", label: "Telegram", type: "text" },
  { key: "password", label: "Password", type: "password" },
];