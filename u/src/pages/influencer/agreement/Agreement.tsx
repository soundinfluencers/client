import { useNavigate, useParams } from "react-router-dom";
import { useAgreementHandlerMutation, useAgreementQuery } from "@/pages/influencer/agreement/hooks/useAgreement.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useUser } from "@/store/get-user";

import { Container, Loader } from "@/components";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";

import { getSocialIcon } from "@/pages/influencer/components/social-accounts-list/data/social-account.data.ts";
import { getArticle } from "@/pages/influencer/agreement/utils/getArticlesForAgreement.ts";

import './_agreement.scss';

export const Agreement = () => {
  const { influencerId } = useParams();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { setUser } = useUser();

  const { data, isPending, isError } = useAgreementQuery(influencerId ?? '');
  const { mutateAsync, isPending: isMutatePending } = useAgreementHandlerMutation();

  // console.log(isFetching);
  const accountList = data ?? [];
  const totalEarnings = accountList.reduce((acc, current) => acc + current.price, 0);

  if (isPending) {
    return (
      <Loader />
    );
  }

  if (isError || !data) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px", fontSize: "40px" }}>
        Unable to load agreement details. Please try again later.
      </p>
    );
  }

  // console.log("Data after normalize", data);


  // console.log("Total earnings", totalEarnings);

  const normalizeEmail = (s: string) => s.trim().replace(/\s+/g, "");
  const buildMailto = (email: string) => `mailto:${normalizeEmail(email)}`;

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
            {data.map(({ socialMedia, username, price }) => (
              <li className="agreement-page__benefits-item" key={socialMedia}>
                <div className="agreement-page__benefits-social">
                  <img
                    src={getSocialIcon(socialMedia) ?? ''}
                    alt={socialMedia}
                  />
                  <p>{username}</p>
                </div>
                <p className="agreement-page__benefits-info">
                  {`${price}\u20AC ${getArticle(socialMedia)}`}
                </p>
              </li>
            ))}
          </ul>

          <div className="agreement-page__info">
            <h2 className="agreement-page__earnings">Estimated total earnings: {totalEarnings}€</h2>
            <div className="agreement-page__conformation">
              <h3 className="agreement-page__conformation-title">Do you want to create your account now?</h3>
              <div className="agreement-page__conformation-actions">

                  <ButtonMain
                    label={isMutatePending ? 'Processing...' : 'Yes'}
                    isDisabled={isMutatePending}
                    onClick={async () => {
                      const res = await mutateAsync({ influencerId: influencerId ?? '', action: 'accept' });
                      console.log('Account creation accepted', res);
                      setUser(res);
                      setAccessToken(res.accessToken);
                      navigate("/influencer", { replace: true });
                    }}
                  />
                  {/*<ButtonSecondary*/}
                  {/*  label={isMutatePending ? 'Processing...' : 'No'}*/}
                  {/*  isDisabled={isMutatePending}*/}
                  {/*  onClick={() => {*/}
                  {/*    const res = mutateAsync({ influencerId: influencerId ?? '', action: 'decline' });*/}
                  {/*    console.log('Account creation declined', res);*/}
                  {/*    navigate("/auth", { replace: true });*/}
                  {/*  }}*/}
                  {/*/>*/}

                <a
                  href={buildMailto('admin@soundinfluencers.com')}
                  target="_blank"
                  rel="noopener noreferrer"
                  // style={{ textDecoration: "underline", color: "black" }}
                  className="agreement-page__conformation-contact"
                  onClick={(e) => {
                    // Prevent default mailto behavior to ensure it works across all browsers
                    e.preventDefault();
                    if (e.defaultPrevented) {
                      window.location.href = buildMailto('admin@soundinfluencers.com');
                    }
                    // console.log("mailto click", { defaultPrevented: e.defaultPrevented });
                  }}
                >
                  No, Review Details
                </a>

                {/*<p className="agreement-page__conformation-contact">No, Review Details</p>*/}
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

// interface IAgreement {
//   socialMedia: TSocialAccounts;
//   username: string;
//   price: number;
// }
//
// const AGREEMENT_MOCK: IAgreement[] = [
//   {
//     socialMedia: 'instagram',
//     username: '@instagram account',
//     price: 10,
//   },
//   {
//     socialMedia: 'tiktok',
//     username: '@tiktok account',
//     price: 10,
//   },
//   {
//     socialMedia: 'spotify',
//     username: '@spotify account',
//     price: 200,
//   },
//   {
//     socialMedia: 'youtube',
//     username: '@youtube account',
//     price: 10,
//   },
//   {
//     socialMedia: 'facebook',
//     username: '@facebook account',
//     price: 50,
//   },
//   {
//     socialMedia: 'soundcloud',
//     username: '@soundcloud account',
//     price: 25,
//   },
//   {
//     socialMedia: 'press',
//     username: '@press account',
//     price: 100,
//   },
// ];