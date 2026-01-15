import './_notifications-via.scss';

import check from '../../../../../assets/notifications-via/check.svg';
import { useState } from 'react';
import type { INotificationMethod } from './types/notification-via.types';
import { NOTIFICATION_METHODS } from './data/notification-via.data';

export const NotificationsVia = () => {
  const [activeNotifications, setActiveNotifications] = useState<INotificationMethod[]>([]);

  const handleActiveNotification = (method: INotificationMethod) => {
    const isActive = activeNotifications.find((item) => item.id === method.id);

    if (isActive) {
      setActiveNotifications(activeNotifications.filter((item) => item.id !== method.id));
    } else {
      setActiveNotifications([...activeNotifications, method]);
    }
  };

  const isNotificationActive = (method: INotificationMethod) => {
    return activeNotifications.some((item) => item.id === method.id);
  }

  return (
    <div className="notifications-via">
      <h4 className='notifications-via__title'>Active notifications via</h4>

      <ul className='notifications-via__list'>
        {NOTIFICATION_METHODS.map((method) => {
          const active = isNotificationActive(method);
          return (
            <li
              key={method.id}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleActiveNotification(method)}
              className={`notifications-via__item ${active ? 'notifications-via__item--active' : ''}`}
              onClick={() => handleActiveNotification(method)}
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
                className={`notifications-via__item-check ${active ? 'notifications-via__item-check--active' : ''}`}
                alt="Check"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}