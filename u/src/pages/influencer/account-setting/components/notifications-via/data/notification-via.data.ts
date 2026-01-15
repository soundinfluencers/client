import type { INotificationMethod } from "../types/notification-via.types";

import email from "../../../../../../assets/notifications-via/mail.svg";
import telegram from "../../../../../../assets/notifications-via/logos_telegram.svg";
import whatsapp from "../../../../../../assets/notifications-via/logos_whatsapp-icon.svg";

export const NOTIFICATION_METHODS: INotificationMethod[] = [
  {
    id: 'email',
    label: "Email",
    icon: email,
  },
  {
    id: 'whatsapp',
    label: "WhatsApp",
    icon: whatsapp,
  },
  {
    id: 'telegram',
    label: "Telegram",
    icon: telegram,
  },
];
