import type { FC } from 'react';
import { ButtonMain } from '../../../../components/ui';
import { TERMS_SECTIONS } from '../../../../constants/influencer/terms/terms.data';
import './_influencer-terms-page.scss';

//TODO: refork button link to close window
export const InfluencerTermsPage: FC = () => {
  const handleClickButton = () => {
    window.close();
  };

  return (
    <div className='terms-page__wrapper'>
      <div className='terms-page'>
        <div className='terms-page__title-block'>
          <p className='terms-page__title'>
            User agreement between Soundinfluencers.com users
          </p>
          <p className='terms-page__subtitle'>
            and Techno TV LTD
          </p>
        </div>

        <p className='terms-page__main-text'>
          This Agreement is entered into between collaborator users of soundinfluencers.com
          (referred to as "collaborators") and TECHNO TV LTD (referred to as the "client"),
          a company incorporated in England and Wales, presently representing
          soundinfluencers.com.
        </p>

        <ul className='terms-page__list'>
          {TERMS_SECTIONS.map((section) => (
            <li key={section.id} className='terms-page__list-item'>
              <p className='terms-page__list-item-header'>
                {section.id}. {section.title}
              </p>

              {'paragraphs' in section &&
                section.paragraphs.map((text, index) => (
                  <p key={index} className='terms-page__main-text'>
                    {text}
                  </p>
                ))}

              {'bullets' in section && (
                <ul className='terms-page__bullet-list'>
                  {section.bullets.map((item, index) => (
                    <li key={index} className='terms-page__bullet-item'>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className='terms-page__controls'>
        <ButtonMain
          text={'Ok'}
          onClick={handleClickButton}
          isDisabled={false}
        />
      </div>
    </div>
  );
};