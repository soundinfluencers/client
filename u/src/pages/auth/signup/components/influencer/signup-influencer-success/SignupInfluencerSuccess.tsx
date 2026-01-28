import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import successImg from '@/assets/icons/success-icon.svg';

import './_signup-influencer-success.scss';

export const SignupInfluencerSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-influencer-success">
      <div className="signup-influencer-success__content">
        <img
          src={successImg}
          alt="Success"
          className="signup-influencer-success__image"
        />
        <div className="signup-influencer-success__info">
          <div className="signup-influencer-success__text-block">
            <h2 className="signup-influencer-success__title">
              Application under review
            </h2>
            <div className="signup-influencer-success__text-group">
              <p className="signup-influencer-success__subtitle">
                Thank you for submitting your details - our team will review your application shortly
              </p>
              <p className="signup-influencer-success__description">
                We’ve received your submission and our team is currently reviewing it. <br />
                If your application meets our criteria, we’ll get in touch with you promptly. <br />
                We appreciate your patience and look forward to welcoming you soon.
              </p>
            </div>
          </div>
          <ButtonMain
            label='Got it'
            onClick={() => navigate('/')}
          />
        </div>
      </div>
    </div>
  );
}
