import { useNavigate } from "react-router-dom";
import { Container } from "@/components";
import emptyListIcon from "@/assets/empty-list/empty-list-img.svg";
import iconCheck from "@/assets/icons/check.svg";
import { ButtonMain, ButtonSecondary } from "@components/ui/buttons-fix/ButtonFix.tsx";

import {
  EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO,
  EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO_TITLE, EMPTY_DISTRIBUTING_LIST_DESCRIPTION, EMPTY_DISTRIBUTING_LIST_TITLE,
} from "@/pages/influencer/promos/distributing/components/empty-distributing-list/data/description.data.ts";

import './_empty-distributing-list.scss';

export const EmptyDistributingList= () => {
  const navigate = useNavigate();

  return (
    <Container className="empty-distributing-list">
      <div className={"empty-distributing-list__main-content"}>
        <div className="empty-distributing-list__title-block">
          <h1 className="empty-distributing-list__title">{EMPTY_DISTRIBUTING_LIST_TITLE}</h1>
          <p className="empty-distributing-list__description">{EMPTY_DISTRIBUTING_LIST_DESCRIPTION}</p>
        </div>

        <img
          className={'empty-distributing-list__img'}
          src={emptyListIcon}
          alt="success icon"
          loading="lazy"
        />

        <div className={'empty-distributing-list__actions'}>
          <ButtonMain
            label={'Go to Dashboard'}
            onClick={() => navigate('/')}
          />

          <ButtonSecondary
            label={'View Requests'}
            onClick={() => navigate('/influencer/promos/new-promos')}
          />
        </div>
      </div>

      <div className="empty-distributing-list__additional-info">
        <p className={'empty-distributing-list__additional-info-title'}>{EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO_TITLE}</p>
        <ul className={'empty-distributing-list__additional-info-options'}>
          {EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO.map(info => (
            <li key={info.id} className={'empty-distributing-list__additional-info-options__item'}>
              <img
                className={'empty-distributing-list__additional-info-icon'}
                src={iconCheck}
                alt=""
                aria-hidden={true}
              />
              {info.text}
            </li>
          ))}
        </ul>
      </div>

      <div className={'empty-distributing-list__footer'}>
        <ButtonSecondary
          label={'Manage Social Accounts'}
          onClick={() => navigate('/influencer/social-accounts')}
        />
      </div>
    </Container>
  );
};
