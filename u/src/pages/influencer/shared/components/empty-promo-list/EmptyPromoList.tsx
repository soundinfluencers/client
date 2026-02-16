import './_empty-promo-list.scss';
// import successIcon from '@/assets/icons/success-icon.svg';
// const logoBlue from '@/assets/logos/logo-main.svg';
import { Container } from "@/components";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { useNavigate } from "react-router-dom";
import React from "react";

//TODO: impl adaptive design for mobile and tablet
interface Props {
  title?: string;
  description?: string;
}

export const EmptyPromosList: React.FC<Props> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <Container className="empty-promo-list">
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="200" viewBox="0 0 24 24" fill="none"
           stroke="#b9d0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
           className="lucide lucide-list-check-icon lucide-list-check">
        <path d="M16 5H3"/>
        <path d="M16 12H3"/>
        <path d="M11 19H3"/>
        <path d="m15 18 2 2 4-4"/>
      </svg>
      {/*<img*/}
      {/*  className={'empty-promo-list__icon'}*/}
      {/*  src={''}*/}
      {/*  alt="success icon"*/}
      {/*/>*/}
      <div className="empty-promo-list__text">
        <h3 className="empty-promo-list__title">{title}</h3>
        <p className="empty-promo-list__description">{description}</p>
      </div>

      <ButtonMain
        className={'empty-promo-list__btn-home'}
        label={'Back to home'}
        onClick={() => navigate('/')}
      />
    </Container>
  );
};