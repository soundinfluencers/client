import './_empty-promo-list.scss';
import emptyListIcon from "@/assets/empty-list/empty-list-img.svg";
import clockRotateIcon from "@/assets/empty-list/clock-rotate.svg";
import { Container } from "@/components";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { useNavigate } from "react-router-dom";
import React from "react";

//TODO: impl adaptive design for mobile and tablet
interface Props {
  title?: string;
  description?: string;
  additionalDescription?: string;
  isDashboard?: boolean;
  isHistory?: boolean;
}

export const EmptyPromosList: React.FC<Props> = ({ title, description, additionalDescription, isDashboard, isHistory }) => {
  const navigate = useNavigate();

  return (
    <Container className="empty-promos-list">
      <img
        className={'empty-promos-list__img'}
        src={isHistory ? clockRotateIcon : emptyListIcon}
        alt=""
        aria-hidden={true}
        loading="lazy"
      />

      <div className={'empty-promos-list__content'}>
        <div className="empty-promos-list__title-block">
          <h1 className="empty-promos-list__title">{title}</h1>
          <div className={'empty-promos-list__description-block'}>
            <p className="empty-promos-list__description">{description}</p>
            {additionalDescription && (
              <p className="empty-promos-list__additional-description">{additionalDescription}</p>
            )}
          </div>
        </div>

        {!isDashboard && (
          <ButtonMain
            label={'Go to Dashboard'}
            onClick={() => navigate('/')}
          />
        )}
        {isHistory && (
          <ButtonMain
            label={'Explore Campaigns'}
            onClick={() => navigate('/influencer/promos/new-promos')}
          />
        )}
      </div>
    </Container>
  );
};
