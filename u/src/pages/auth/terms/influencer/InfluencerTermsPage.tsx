import type { FC } from 'react';
import {
  TERMS_MAIN_TEXT,
  TERMS_SECTIONS,
  TERMS_SUBTITLE,
  TERMS_TITLE,
} from '@/constants/influencer/terms/terms.data.ts';
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";

import './_influencer-terms-page.scss';
import { Container } from "@/components";

export const InfluencerTermsPage: FC = () => {
  const handleClickButton = () => {
    window.close();
  };

  return (
    <Container className="terms-page">
      <div className="terms-page__title-block">
        <h1 className="terms-page__title">
          {TERMS_TITLE}
        </h1>
        <p className="terms-page__subtitle">
          {TERMS_SUBTITLE}
        </p>
      </div>

      <div className="terms-page__wrapper">
        <p className="terms-page__main-text">
          {TERMS_MAIN_TEXT}
        </p>

        <ul className="terms-page__list">
          {TERMS_SECTIONS.map((section) => (
            <li key={section.id} className="terms-page__list-item">
              <p className="terms-page__list-item-header">
                {section.id}. {section.title}
              </p>

              {section.paragraphs.map(({ number, boldText, text }) => (
                <p key={number} className="terms-page__list-item-text">
                  {number} {boldText && <span>{boldText}</span>} {text}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <div className="terms-page__accept-button">
        <ButtonMain
          label={'Ok'}
          onClick={handleClickButton}
          isDisabled={false}
        />
      </div>
    </Container>
  );
};
