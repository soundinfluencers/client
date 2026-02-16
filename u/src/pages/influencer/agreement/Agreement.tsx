import { Container } from "@/components";
import { ButtonMain, ButtonSecondary } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { getSocialIcon } from "@/pages/influencer/components/social-accounts-list/data/social-account.data.ts";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

import './_agreement.scss';

//TODO: add real data and links, add real actions for buttons
export const Agreement = () => {
  return (
    <Container className="agreement-page">
      <div className="agreement-page__wrapper">
        <div className="agreement-page__header">
          <h1 className="agreement-page__title">Congratulations</h1>
          <p className="agreement-page__subtitle">
            Your account has been approved!
          </p>
        </div>

        <div className="agreement-page__content">
          <h2 className="agreement-page__content-title">Here’s what you’ll earn</h2>

          <ul className="agreement-page__benefits-list">
            {AGREEMENT_MOCK.map(({ socialMedia, username, reward }) => (
              <li className="agreement-page__benefits-item" key={socialMedia}>
                <div className="agreement-page__benefits-social">
                  <img
                    src={getSocialIcon(socialMedia) ?? ''}
                    alt={socialMedia}
                  />
                  <p>{username}</p>
                </div>
                <p className="agreement-page__benefits-info">
                  {`${reward}\u20AC ${getArticle(socialMedia)}`}
                </p>
              </li>
            ))}
          </ul>

          <div className="agreement-page__info">
            <h2 className="agreement-page__earnings">Estimated total earnings: 237€</h2>
            <div className="agreement-page__conformation">
              <h3 className="agreement-page__conformation-title">Do you want to create your account now?</h3>
              <div className="agreement-page__conformation-actions">
                <div className="agreement-page__conformation-buttons">
                  <ButtonMain
                    label={'Yes'}
                    onClick={() => console.log('Account created')}
                  />
                  <ButtonSecondary
                    label={'No'}
                    onClick={() => console.log('Account creation declined')}
                  />
                </div>
                <p className="agreement-page__conformation-contact">Contact Us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="agreement-page__terms">
            By clicking Yes, you confirm and approve the rates listed above and agree to our{'\n'}
        <a
          href="/terms/influencer"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", color: "black" }}
        >
             Terms & Conditions.
            </a>
          </span>
    </Container>
  );
};

interface IAgreement {
  socialMedia: TSocialAccounts;
  username: string;
  reward: number;
}

const AGREEMENT_MOCK: IAgreement[] = [
  {
    socialMedia: 'instagram',
    username: '@instagram account',
    reward: 10,
  },
  {
    socialMedia: 'tiktok',
    username: '@tiktok account',
    reward: 10,
  },
  {
    socialMedia: 'spotify',
    username: '@spotify account',
    reward: 200,
  },
  {
    socialMedia: 'youtube',
    username: '@youtube account',
    reward: 10,
  },
  {
    socialMedia: 'facebook',
    username: '@facebook account',
    reward: 50,
  },
  {
    socialMedia: 'soundcloud',
    username: '@soundcloud account',
    reward: 25,
  },
  {
    socialMedia: 'press',
    username: '@press account',
    reward: 100,
  },
];

const getArticle = (socialMedia: TSocialAccounts) => {
  switch (socialMedia) {
    case "instagram":
      return 'each post + story';
    case "tiktok":
      return 'each post + story';
    case "spotify":
      return 'each feedback + story';
    case "youtube":
      return 'each post';
    case "facebook":
      return 'each post + story';
    case "soundcloud":
      return 'each repost';
    case "press":
      return 'each article';
    default:
      return '';
  }
}