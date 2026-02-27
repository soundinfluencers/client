import React from "react";
import check from '../../../../../assets/notifications-via/check.svg';
import type { TNotificationViaApi } from './types/notification-via.types';
import { NOTIFICATION_METHODS } from './data/notification-via.data';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfluencerNotificationMethods } from "@/api/influencer/profile/influencer-profile.api.ts";
import { handleApiError } from "@/api/error.api.ts";
import { toast } from "react-toastify";

import './_notifications-via.scss';
import type { InfluencerProfileApi } from "@/types/user/influencer.types.ts";

interface NotificationsViaProps {
  notificationMethods: TNotificationViaApi | undefined;
}

export const NotificationsVia: React.FC<NotificationsViaProps> = ({ notificationMethods }) => {
  const qc = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: updateInfluencerNotificationMethods,
    onSuccess: (data) => {
      // Handle success, e.g., show a success message or refresh data
      // qc.invalidateQueries({ queryKey: ["influencerProfile"] });
      qc.setQueryData(["influencerProfile"], (old: InfluencerProfileApi) => {
        if (!old) return old;

        // console.log("Old influencer profile data:", old);
        // console.log("Updated notification methods:", data.telegram, data.whatsapp);

        return { ...old, notificationMethods: { ...data } };
      });
      toast.success("Phone notification via updated successfully");
      console.log("Notification via method updated successfully");
    },
    onError: handleApiError,
  });

  return (
    <div className="notifications-via">
      <p className='notifications-via__title'>Phone notifications via</p>

      <ul className='notifications-via__list'>
        {NOTIFICATION_METHODS.map((method) => (
          <li
            key={method.id}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && mutateAsync(method.id)}
            className={`notifications-via__item ${notificationMethods?.[method.id] ? 'notifications-via__item--active' : ''}`}
            onClick={() => mutateAsync(method.id)}
          >
            <div className='notifications-via__item-info'>
              <img
                src={method.icon}
                className='notifications-via__item-icon'
                alt={method.label}
              />
              {method.label}
            </div>
            <img
              src={check}
              className={`notifications-via__item-check ${notificationMethods?.[method.id] ? 'notifications-via__item-check--active' : ''}`}
              alt="Check"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// const handleActiveNotification = (method: INotificationMethod) => {
//   if (activeNotifications?.id === method.id) {
//     setActiveNotifications(null);
//   } else {
//     setActiveNotifications(method);
//   }
// };


// (payload: any) => {
//   // Call your API to update the notification via method here
//   console.log("Updating notification via method with payload:", payload);
//   // Example: return updateNotificationVia(payload);
// }
// (error) => {
//   // Handle error, e.g., show an error message
//   console.error("Error updating notification via method:", error);
// }

// const [activeNotifications, setActiveNotifications] = useState<INotificationMethod[]>([]);
// const handleActiveNotification = (method: INotificationMethod) => {
//   const isActive = activeNotifications.find((item) => item.id === method.id);
//
//   if (isActive) {
//     setActiveNotifications(activeNotifications.filter((item) => item.id !== method.id));
//   } else {
//     setActiveNotifications([...activeNotifications, method]);
//   }
// };
//
// const isNotificationActive = (method: INotificationMethod) => {
//   return activeNotifications.some((item) => item.id === method.id);
// }

// <ul className='notifications-via__list'>
//   {NOTIFICATION_METHODS.map((method) => {
//     const active = isNotificationActive(method);
//     return (
//       <li
//         key={method.id}
//         role='button'
//         tabIndex={0}
//         onKeyDown={(e) => e.key === 'Enter' && handleActiveNotification(method)}
//         className={`notifications-via__item ${active ? 'notifications-via__item--active' : ''}`}
//         onClick={() => handleActiveNotification(method)}
//       >
//         <div className='notifications-via__item-info'>
//           <img
//             src={method.icon}
//             className='notifications-via__item-icon'
//             alt={method.label}
//           />
//           {method.label}
//         </div>
//         <img
//           src={check}
//           className={`notifications-via__item-check ${active ? 'notifications-via__item-check--active' : ''}`}
//           alt="Check"
//         />
//       </li>
//     );
//   })}
// </ul>