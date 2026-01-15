import type React from "react"
import { useEffect } from 'react';
import { useAccountSetupStore } from "./store/useAccountSetupStore";
import { Form } from '../../../../components/form/form';
import { AccountSetupFormContent } from './components/account-setup-form-content/AccountSetupFormContent';

import { getDefaultValues } from "./utils/get-form-default-values";
import { normalizePlatform } from "./utils/normalize-social-media-name";
import type { ISocialAccountFormValues, TMode, TSocialAccounts } from "./types/account-setup.types";

import arrowLeft from '../../../../assets/icons/arrow-left.svg';
import './_account-setup-form.scss';

interface Props {
  platform: TSocialAccounts;
  mode: TMode;
  account?: ISocialAccountFormValues;
  onSave: (data: ISocialAccountFormValues) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
}


const accountsTestData: any = {
  instagram: [
    {
      accountId: "1",
      username: "ivan.music",
      profileLink: "https://instagram.com/ivan.music",
      followers: 48200,
      logoUrl: "/2.jpg",
      profileCategory: "community",
      price: 350,
      publicPrice: 400,
      currency: "EUR",
      initialPrice: 300,
      engagementRate: 4.8,
      averageViews: 12000,
      musicGenres: ["techno", "melodic_minimal", "hard_peak"],
      creatorCategories: ["ibiza", "dancing"],
      countries: [
        { country: "Ukraine", percentage: 50 },
        { country: "Poland", percentage: 30 },
        { country: "Germany", percentage: 20 },
      ],
      categories: ["music", "lifestyle"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
    {
      accountId: "2",
      username: "ivan.balance",
      profileLink: "https://instagram.com/ivan.balance",
      followers: 48200,
      logoUrl: "/2.jpg",
      profileCategory: "community",
      price: 350,
      publicPrice: 400,
      currency: "EUR",
      initialPrice: 300,
      engagementRate: 4.8,
      averageViews: 12000,
      musicGenres: ["techno", "melodic_minimal", "hard_peak"],
      creatorCategories: ["ibiza", "dancing"],
      countries: [
        { country: "Germany", percentage: 50 },
        { country: "Afghanistan", percentage: 30 },
        { country: "Algeria", percentage: 20 },
      ],
      categories: ["music", "lifestyle"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  tiktok: [
    {
      accountId: "1",
      username: "ivanbeats",
      profileLink: "https://tiktok.com/@ivanbeats",
      followers: 153000,
      logoUrl: "/2.jpg",
      profileCategory: "creator",
      price: 500,
      publicPrice: 550,
      currency: "EUR",
      initialPrice: 450,
      engagementRate: 7.2,
      averageViews: 56000,
      musicGenres: [],
      creatorCategories: ["lifestyle", "beauty", "fitness", "lipsync"],
      countries: [
        { country: "Ukraine", percentage: 60 },
        { country: "Canada", percentage: 15 },
      ],
      categories: ["music", "short-video"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  spotify: [
    {
      accountId: "1",
      username: "Ivan Official",
      profileLink: "https://open.spotify.com/artist/123456",
      followers: 18200,
      logoUrl: "/2.jpg",
      profileCategory: "creator",
      price: 800,
      publicPrice: 900,
      currency: "EUR",
      initialPrice: 700,
      engagementRate: 3.1,
      averageViews: 0,
      musicGenres: [],
      creatorCategories: ["lyrics", "reactions", "music"],
      countries: [
        { country: "Ukraine", percentage: 50 },
        { country: "France", percentage: 30 },
        { country: "Italy", percentage: 20 },
      ],
      categories: ["streaming"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  soundcloud: [
    {
      accountId: "1",
      username: "ivan-music",
      profileLink: "https://soundcloud.com/ivan-music",
      followers: 9400,
      logoUrl: "/2.jpg",
      profileCategory: "community",
      price: 150,
      publicPrice: 180,
      currency: "EUR",
      initialPrice: 120,
      engagementRate: 2.6,
      averageViews: 2300,
      musicGenres: ["bass", "dubstep"],
      creatorCategories: ["meme"],
      countries: [{ country: "Ukraine", percentage: 100 }],
      categories: ["music"],
      isHidden: false,
      isDeleted: false,
      isVerified: false,
    },
  ],
  facebook: [
    {
      accountId: "1",
      username: "Ivan Music Page",
      profileLink: "https://facebook.com/ivanmusicpage",
      followers: 8700,
      logoUrl: "/2.jpg",
      profileCategory: "community",
      price: 120,
      publicPrice: 150,
      currency: "EUR",
      initialPrice: 100,
      engagementRate: 1.9,
      averageViews: 1800,
      musicGenres: ["pop"],
      creatorCategories: ["dancing"],
      countries: [
        { country: "Ukraine", percentage: 70 },
        { country: "Romania", percentage: 30 },
      ],
      categories: ["music", "community"],
      isHidden: false,
      isDeleted: false,
      isVerified: false,
    },
  ],
  youtube: [
    {
      accountId: "1",
      username: "Ivan Music Channel",
      profileLink: "https://youtube.com/@ivanmusic",
      followers: 62300,
      logoUrl: "/2.jpg",
      profileCategory: "creator",
      price: 650,
      publicPrice: 700,
      currency: "EUR",
      initialPrice: 600,
      engagementRate: 5.4,
      averageViews: 24000,
      musicGenres: [],
      creatorCategories: ["cosplay", "lifestyle"],
      countries: [
        { country: "Ukraine", percentage: 60 },
        { country: "Great Britain", percentage: 40 },
      ],
      categories: ["music", "video"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  press: [
    {
      accountId: "1",
      username: "Ivan Press Kit",
      profileLink: "https://press.example.com/ivan",
      followers: 0,
      logoUrl: "/2.jpg",
      profileCategory: "community",
      price: 1000,
      publicPrice: 1200,
      currency: "EUR",
      initialPrice: 900,
      engagementRate: 0,
      averageViews: 0,
      musicGenres: ["pop"],
      creatorCategories: ["meme"],
      countries: [{ country: "EU", percentage: 100 }],
      categories: ["press", "media"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
};

// /*
//   TODO: Account setup flow - all ready (need minor fix connect api);
//         10) Add form validation and disable submit if not fill required fields
//         12) Add optimization for AccountDetails component (memo, useCallback)
// */

export const AccountSetupForm: React.FC<Props> = ({ platform, mode, account, onRemove, onSave }) => {
  const { onResetAccountForm } = useAccountSetupStore();

  console.log(account?.accountId);
  console.log(account?.username);
  console.log(platform);

  const preparedAccountData = account?.accountId ? accountsTestData[platform].find((acc: any) => acc.accountId === account.accountId) : account;

  console.log(preparedAccountData);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="account-setup-form">
      <button onClick={() => onResetAccountForm()} className="account-setup-form__btn-back">
        <img src={arrowLeft} alt="Go back" />
      </button>
      <div className="account-setup-form__header">
        <h2 className="account-setup-form__title">{mode === 'edit' ? `Edit your ${normalizePlatform(platform)} Account Setup` : `${normalizePlatform(platform)} Account Setup`}</h2>
        {mode !== 'edit' && <p className="account-setup-form__subtitle">Add your page info and audience insights</p>}
      </div>

      <Form
        className="account-setup-form__form"
        // submitButton={<ButtonMain label='Save' type='submit' />}
        onSubmit={() => { }}
        defaultValues={getDefaultValues(mode, preparedAccountData)}
      >
        <AccountSetupFormContent
          platform={platform}
          onRemove={onRemove}
          onSave={onSave}
          mode={mode}
        />
      </Form>
    </div>
  )
};