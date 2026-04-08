import { useNavigate } from "react-router-dom";
import { Container } from "@/components";
import { ButtonMain, ButtonSecondary } from "@components/ui/buttons-fix/ButtonFix.tsx";
import clockRotateIcon from "@/assets/empty-list/clock-rotate.svg";

import './_empty-invoices-history.scss';

export const EmptyInvoicesHistory = () => {
  const navigate = useNavigate();

  return (
    <Container className="empty-invoices-history">
      <img
        className={'empty-invoices-history__img'}
        src={clockRotateIcon}
        alt="Clock rotate icon indicating no history"
        loading="lazy"
      />

      <div className={'empty-invoices-history__content'}>
        <div className="empty-invoices-history__title-block">
          <h1 className="empty-invoices-history__title">Your Earnings Will Appear Here</h1>
          <div className={'empty-invoices-history__description-block'}>
            <p className="empty-invoices-history__description-title">You haven’t completed any paid collaborations yet.</p>
            <p className="empty-invoices-history__description">After finishing a campaign and submitting insights, you’ll be able to create invoices and monitor your payment status in this section.</p>
            <p className="empty-invoices-history__description">Start by accepting your first promotion opportunity.</p>
          </div>
        </div>


        <div className={'empty-invoices-history__buttons'}>
          <ButtonMain
            label={'Browse Campaigns'}
            onClick={() => navigate('/influencer/promos/new-promos')}
          />


          <ButtonSecondary
            label={'Go to Dashboard'}
            onClick={() => navigate('/')}
          />
        </div>

      </div>
    </Container>
  );
};
