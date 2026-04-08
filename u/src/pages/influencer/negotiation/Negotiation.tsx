import { useEffect } from "react";
import { Container, Form, Loader } from "@/components";
import { TextArea } from "@/pages/influencer/negotiation/componetns/text-area/TextArea.tsx";
import { PriceInput } from "@/pages/influencer/components/account-setup-form/components/price-input/PriceInput.tsx";
import { useSocialAccountQuery } from "@/pages/influencer/account-setting/hooks/socialAccounts.hooks.ts";
import { useLocation, useNavigate } from "react-router-dom";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

import { MEDIA_ICONS_MAP } from "@/pages/influencer/negotiation/utils/media-icon.map.ts";
import { normalizeSocialMediaName } from "@/pages/influencer/negotiation/utils/social-media-name.normalize.ts";
import './_negotiation.scss';
import { NEGOTIATION_ACCOUNT_CARD_FIELDS } from "@/pages/influencer/negotiation/data/negotiation.fields.map.ts";
import { isFieldVisible } from "@/pages/influencer/negotiation/utils/negotiation-card-field.normalize.ts";
import { renderValue } from "@/pages/influencer/negotiation/utils/card-field.render.tsx";
import {
  type NegotiationFormData,
  negotiationSchema,
} from "@/pages/influencer/negotiation/validation/negotiation.shema.ts";
import { ButtonMain, ButtonSecondary } from "@components/ui/buttons-fix/ButtonFix.tsx";

type NegotiationLocationState = {
  accountId: string;
  socialMedia: TSocialAccounts;
};

export const Negotiation = () => {
  const navigation = useNavigate();
  const location = useLocation();
  const state = location.state as NegotiationLocationState;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { accountId, socialMedia } = state;

  const {
    data: rqAccountData,
    isPending: isAccountLoading,
    isError: isAccountError,
  } = useSocialAccountQuery(socialMedia,  accountId);

  if (isAccountLoading) {
    return <Loader />;
  }

  if (isAccountError) {
    return <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      fontSize: "48px",
      color: "#202934",
    }}>
      No account data
    </div>;
  }

  // console.log(JSON.stringify(rqAccountData));

  // const pole = MOCK_SOCIAL_ACCOUNTS[1];

  //NEGOTIATION_ACCOUNT_CARD_FIELDS['instagram']

  const fields = NEGOTIATION_ACCOUNT_CARD_FIELDS[socialMedia]
    .filter((f) => isFieldVisible(f, rqAccountData.profileCategory));

  const handleSubmit = (data: NegotiationFormData) => {
    console.log(data);
  };

  return (
    <Container className={'negotiation'}>
      <header className={'negotiation__header'}>
        <h1 className={'negotiation__title'}>Account submission negotiation</h1>
        <p className={'negotiation__subtitle'}>Review the requested rate and send a counter-offer.</p>
      </header>

      <section className="negotiation__details">
        <h2 className="negotiation__section-title">
          Influencer details
        </h2>

        <article className="negotiation__card">
          <div className="negotiation__card-header">
            <div className={'negotiation__card-logo'}>
              <img
                src={MEDIA_ICONS_MAP[socialMedia] ?? ''}
                alt={`${socialMedia} logo`}
                loading={'lazy'}
              />
            </div>
            <p className="negotiation__card-social">{normalizeSocialMediaName(socialMedia)}</p>
          </div>

          <ul className={'negotiation__card-body'}>
            {fields.map((field) => (
              <li key={field.key} className="negotiation__card-field">
                <span className="negotiation__card-field-label">{field.label}</span>
                <span className="negotiation__card-field-value">{renderValue(field, rqAccountData)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="negotiation__form-section">
        <h2 className="negotiation__section-title">
          Requested offer
        </h2>

        <Form<NegotiationFormData>
          className={'negotiation__form'}
          onSubmit={handleSubmit}
          schema={negotiationSchema}
          validateMode={"onSubmit"}
        >
          <PriceInput
            placeholder={`Enter the rate you'd like to offer`}
            label={'Your counter-offer'}
          />
          <TextArea name="message" />

          <div className={'negotiation__form-cta'}>
            <ButtonMain
              label={'Send offer'}
              type={'submit'}
            />
            <ButtonSecondary
              label={'Cancel'}
              type={'button'}
              onClick={() => navigation(-1)}
            />
          </div>
        </Form>
      </section>
    </Container>
  );
};

// export const MOCK_SOCIAL_ACCOUNTS = [
//   // INSTAGRAM COMMUNITY
//   {
//     accountId: "ig-1",
//     username: "TechnoCommunity",
//     profileLink: "https://instagram.com/technocommunity",
//     followers: 124500,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 250,
//     currency: "USD",
//
//     musicGenres: [
//       {
//         genre: "Techno",
//         subGenres: ["Melodic", "Minimal"],
//       },
//       {
//         genre: "House",
//         subGenres: ["Afro House"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [
//       { country: "US", percentage: 24.5 },
//       { country: "Brazil", percentage: 12 },
//       { country: "Germany", percentage: 9.5 },
//       { country: "UK", percentage: 7.2 },
//     ],
//   },
//
//   // INSTAGRAM CREATOR
//   {
//     accountId: "ig-creator-1",
//     username: "DJ_Aurora",
//     profileLink: "https://instagram.com/dj_aurora",
//     followers: 85400,
//     logoUrl: null,
//
//     profileCategory: "creator",
//
//     initialPrice: 400,
//     currency: "USD",
//
//     musicGenres: [],
//
//     categories: [],
//     creatorCategories: ["DJ", "Producer", "Live Performer"],
//
//     countries: [
//       { country: "UK", percentage: 28 },
//       { country: "France", percentage: 18 },
//       { country: "Spain", percentage: 11 },
//     ],
//   },
//
//   // TIKTOK COMMUNITY
//   {
//     accountId: "tt-1",
//     username: "UndergroundBeats",
//     profileLink: "https://tiktok.com/@undergroundbeats",
//     followers: 342000,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 320,
//     currency: "EUR",
//
//     musicGenres: [
//       {
//         genre: "House",
//         subGenres: ["Deep House", "Progressive"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [
//       { country: "Italy", percentage: 19 },
//       { country: "Germany", percentage: 16 },
//       { country: "Netherlands", percentage: 12 },
//     ],
//   },
//
//   // YOUTUBE CREATOR
//   {
//     accountId: "yt-creator-1",
//     username: "StudioProducer",
//     profileLink: "https://youtube.com/@studioproducer",
//     followers: 156000,
//     logoUrl: null,
//
//     profileCategory: "creator",
//
//     initialPrice: 550,
//     currency: "USD",
//
//     musicGenres: [],
//
//     categories: [],
//     creatorCategories: ["Music Production", "Tutorials"],
//
//     countries: [
//       { country: "US", percentage: 31 },
//       { country: "Canada", percentage: 12 },
//       { country: "Australia", percentage: 8 },
//     ],
//   },
//
//   // SPOTIFY COMMUNITY
//   {
//     accountId: "sp-1",
//     username: "ChillTechnoPlaylist",
//     profileLink: "https://open.spotify.com/playlist/123",
//     followers: 50200,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 180,
//     currency: "USD",
//
//     musicGenres: [
//       {
//         genre: "Techno",
//         subGenres: ["Melodic"],
//       },
//       {
//         genre: "Ambient",
//         subGenres: ["Deep Ambient"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [
//       { country: "Germany", percentage: 22 },
//       { country: "Netherlands", percentage: 15 },
//       { country: "UK", percentage: 10 },
//     ],
//   },
//
//   // SOUNDCLOUD COMMUNITY
//   {
//     accountId: "sc-1",
//     username: "BassUnderground",
//     profileLink: "https://soundcloud.com/bassunderground",
//     followers: 78000,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 140,
//     currency: "EUR",
//
//     musicGenres: [
//       {
//         genre: "Drum & Bass",
//         subGenres: ["Liquid", "Neurofunk"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [
//       { country: "UK", percentage: 25 },
//       { country: "Poland", percentage: 11 },
//       { country: "Czechia", percentage: 9 },
//     ],
//   },
//
//   // FACEBOOK COMMUNITY
//   {
//     accountId: "fb-1",
//     username: "FestivalCommunity",
//     profileLink: "https://facebook.com/festivalcommunity",
//     followers: 91000,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 200,
//     currency: "USD",
//
//     musicGenres: [
//       {
//         genre: "EDM",
//         subGenres: ["Festival EDM"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [
//       { country: "US", percentage: 35 },
//       { country: "Mexico", percentage: 14 },
//       { country: "Spain", percentage: 9 },
//     ],
//   },
//
//   // PRESS
//   {
//     accountId: "press-1",
//     username: "Electronic Music Daily",
//     profileLink: "https://electronicmusicdaily.com",
//     followers: 0,
//     logoUrl: null,
//
//     profileCategory: "community",
//
//     initialPrice: 300,
//     currency: "USD",
//
//     musicGenres: [
//       {
//         genre: "Electronic",
//         subGenres: ["Techno", "House"],
//       },
//     ],
//
//     categories: [],
//     creatorCategories: [],
//
//     countries: [],
//   },
// ];
