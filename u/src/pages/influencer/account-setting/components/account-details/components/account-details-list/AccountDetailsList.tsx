import { useUserStore } from '../../../../../../../store/influencer/account-settings/useUserStore';
import { ACCOUNT_DETAILS_FIELDS } from './data/account-details-list.data';

import './_account-details-list.scss';

// interface Props {
//   userData: any;
// }

export const AccountDetailsList: React.FC = () => {
  const { user } = useUserStore();

  return (
    <ul className='account-details-list'>
      {ACCOUNT_DETAILS_FIELDS.map(({ key, label, type }) => (
        <li key={key} className={`account-details-list__item ${type === "avatar" ? "account-details-list__item--avatar" : ""}`}>
          <span className='account-details-list__label'>{label}</span>
          <span className='account-details-list__value'>
            {type === "avatar" && <img src={user[key] ?? '/2.png'} alt="Profile" className='account-details-list__img' />}
            {type === "password" &&
              <span className='account-details-list__password'>
                {"*********"}
              </span>
            }
            {type === "text" && user[key]}
          </span>
        </li>
      ))}
    </ul>
  );
}