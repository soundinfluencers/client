import { useInfluenserProfileStore } from '@/store/influencer/account-settings/useInfluenserProfileStore';
import { ACCOUNT_DETAILS_FIELDS } from './data/account-details-list.data';

import './_account-details-list.scss';

export const AccountDetailsList: React.FC = () => {
  const { profile } = useInfluenserProfileStore();

  //type === "avatar"
  return (
    <ul className='account-details-list'>
      {ACCOUNT_DETAILS_FIELDS.map(({ key, label, type }) => (
        <li key={key} className={`account-details-list__item ${false ? "account-details-list__item--avatar" : ""}`}>
          <span className='account-details-list__label'>{label}</span>
          <span className='account-details-list__value'>
            {/* {type === "avatar" && <img src={profile?.[key] ? profile?.[key] : '/user.png'} alt="Profile Avatar" className='account-details-list__img' />} */}
            {type === "password" &&
              <span className='account-details-list__password'>
                {"*********"}
              </span>
            }
            {type === "text" && (profile?.[key] ?? 'N/A')}
          </span>
        </li>
      ))}
    </ul>
  );
}