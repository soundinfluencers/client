type TextUserKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "telegram"
  | "whatsapp";

type AvatarUserKey = "logosUrl";
type PasswordUserKey = "password";

export type AccountDetailsField =
  | {
      type: "text";
      key: TextUserKey;
      label: string;
    }
  | {
      type: "avatar";
      key: AvatarUserKey;
      label: string;
    }
  | {
      type: "password";
      key: PasswordUserKey;
      label: string;
    };
