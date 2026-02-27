export type TNotificationVia = 'telegram' | 'whatsapp';

export interface INotificationMethod {
  id: TNotificationVia;
  label: string;
  icon: string;
}

export type TNotificationViaApi = Record<TNotificationVia, boolean>;