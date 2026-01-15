import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { IUser } from "../../../pages/influencer/account-setting/types/user";
import type { TSocialAccounts } from "../../../pages/influencer/components/account-setup-form/types/account-setup.types";


const user: any = {
  firstName: "Ivan",
  lastName: "Creator",
  email: "ivan.creator@gmail.com",
  phone: "+380501234567",
  password: "Test1234!",
  logosUrl: "/2.jpg",
  telegram: "@ivan_creator",
  whatsapp: "+380501234567",
  instagram: [
    {
      accountId: "1",
      username: "ivan.music",
      // profileLink: "https://instagram.com/ivan.music",
      // followers: 48200,
      // logoUrl: "/2.jpg",
      // profileCategory: "community",
      // price: 350,
      // publicPrice: 400,
      // currency: "EUR",
      // initialPrice: 300,
      // engagementRate: 4.8,
      // averageViews: 12000,
      // musicGenres: ["techno", "melodic_minimal", "hard_peak"],
      // creatorCategories: ["ibiza", "dancing"],
      // countries: [
      //   { country: "Ukraine", percentage: 50 },
      //   { country: "Poland", percentage: 30 },
      //   { country: "Germany", percentage: 20 },
      // ],
      // categories: ["music", "lifestyle"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
    {
      accountId: "2",
      username: "ivan.balance",
      // profileLink: "https://instagram.com/ivan.balance",
      // followers: 48200,
      // logoUrl: "/2.jpg",
      // profileCategory: "community",
      // price: 350,
      // publicPrice: 400,
      // currency: "EUR",
      // initialPrice: 300,
      // engagementRate: 4.8,
      // averageViews: 12000,
      // musicGenres: ["techno", "melodic_minimal", "hard_peak"],
      // creatorCategories: ["ibiza", "dancing"],
      // countries: [
      //   { country: "Germany", percentage: 50 },
      //   { country: "Afghanistan", percentage: 30 },
      //   { country: "Algeria", percentage: 20 },
      // ],
      // categories: ["music", "lifestyle"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
  ],
  tiktok: [
    {
      accountId: "1",
      username: "ivanbeats",
      // profileLink: "https://tiktok.com/@ivanbeats",
      // followers: 153000,
      // logoUrl: "/2.jpg",
      // profileCategory: "creator",
      // price: 500,
      // publicPrice: 550,
      // currency: "EUR",
      // initialPrice: 450,
      // engagementRate: 7.2,
      // averageViews: 56000,
      // musicGenres: [],
      // creatorCategories: ["lifestyle", "beauty", "fitness", "lipsync"],
      // countries: [
      //   { country: "Ukraine", percentage: 60 },
      //   { country: "Canada", percentage: 15 },
      // ],
      // categories: ["music", "short-video"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
  ],
  spotify: [
    {
      accountId: "1",
      username: "Ivan Official",
      // profileLink: "https://open.spotify.com/artist/123456",
      // followers: 18200,
      // logoUrl: "/2.jpg",
      // profileCategory: "creator",
      // price: 800,
      // publicPrice: 900,
      // currency: "EUR",
      // initialPrice: 700,
      // engagementRate: 3.1,
      // averageViews: 0,
      // musicGenres: [],
      // creatorCategories: ["lyrics", "reactions", "music"],
      // countries: [
      //   { country: "Ukraine", percentage: 50 },
      //   { country: "France", percentage: 30 },
      //   { country: "Italy", percentage: 20 },
      // ],
      // categories: ["streaming"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
  ],
  soundcloud: [
    {
      accountId: "1",
      username: "ivan-music",
      // profileLink: "https://soundcloud.com/ivan-music",
      // followers: 9400,
      // logoUrl: "/2.jpg",
      // profileCategory: "community",
      // price: 150,
      // publicPrice: 180,
      // currency: "EUR",
      // initialPrice: 120,
      // engagementRate: 2.6,
      // averageViews: 2300,
      // musicGenres: ["bass", "dubstep"],
      // creatorCategories: ["meme"],
      // countries: [{ country: "Ukraine", percentage: 100 }],
      // categories: ["music"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: false,
    },
  ],
  facebook: [
    {
      accountId: "1",
      username: "Ivan Music Page",
      // profileLink: "https://facebook.com/ivanmusicpage",
      // followers: 8700,
      // logoUrl: "/2.jpg",
      // profileCategory: "community",
      // price: 120,
      // publicPrice: 150,
      // currency: "EUR",
      // initialPrice: 100,
      // engagementRate: 1.9,
      // averageViews: 1800,
      // musicGenres: ["pop"],
      // creatorCategories: ["dancing"],
      // countries: [
      //   { country: "Ukraine", percentage: 70 },
      //   { country: "Romania", percentage: 30 },
      // ],
      // categories: ["music", "community"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: false,
    },
  ],
  youtube: [
    {
      accountId: "1",
      username: "Ivan Music Channel",
      // profileLink: "https://youtube.com/@ivanmusic",
      // followers: 62300,
      // logoUrl: "/2.jpg",
      // profileCategory: "creator",
      // price: 650,
      // publicPrice: 700,
      // currency: "EUR",
      // initialPrice: 600,
      // engagementRate: 5.4,
      // averageViews: 24000,
      // musicGenres: [],
      // creatorCategories: ["cosplay", "lifestyle"],
      // countries: [
      //   { country: "Ukraine", percentage: 60 },
      //   { country: "Great Britain", percentage: 40 },
      // ],
      // categories: ["music", "video"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
  ],
  press: [
    {
      accountId: "1",
      username: "Ivan Press Kit",
      // profileLink: "https://press.example.com/ivan",
      // followers: 0,
      // logoUrl: "/2.jpg",
      // profileCategory: "community",
      // price: 1000,
      // publicPrice: 1200,
      // currency: "EUR",
      // initialPrice: 900,
      // engagementRate: 0,
      // averageViews: 0,
      // musicGenres: ["pop"],
      // creatorCategories: ["meme"],
      // countries: [{ country: "EU", percentage: 100 }],
      // categories: ["press", "media"],
      // isHidden: false,
      // isDeleted: false,
      // isVerified: true,
    },
  ],
  // internalNote:
  //   "Top creator for music campaigns. Priority platforms: TikTok & YouTube.",
};

//TODO: fix types any where possible
interface UserStore {
  user: IUser;
  setUser: (user: IUser) => void;

  saveAccount: (platform: TSocialAccounts, account: any) => void;
  removeAccount: (platform: TSocialAccounts, accountId: string) => void;

  saveUserDetails: (data: any) => void;
}

export const useUserStore = create<UserStore>()(
  immer((set) => ({
    user,

    setUser: (user: IUser) =>
      set((state) => {
        state.user = user;
      }),

    saveAccount: (platform: TSocialAccounts, account: any) =>
      set((state) => {
        console.log('Payloda:', platform, account);

        const list = state.user[platform];
        if (!Array.isArray(list)) return;

        console.log('List accounts before edit:', list);

        // edit existing
        if (account.accountId !== undefined) {
          // if (account.accountId < 0 || account.accountId >= list.length) return;
          const index = list.findIndex((acc: any) => acc.accountId === account.accountId);
          console.log(index);
          console.log('Accont before edit:', list[index]);
          if (index === -1) return;
          list[index] = {
            ...list[index],
            ...account,
          };
          console.log('Accont after edit:', list[index]);
          return;
        }

        // create new
        // console.log('Creating new account:', account);
        list.push({ accountId: String(list.length + 1), ...account });
        // console.log('List accounts after create:', list);
      }),

    removeAccount: (platform: TSocialAccounts, accountId: string) => {
      set((state) => {
        console.log("Payload:", platform, accountId);
        const list = state.user?.[platform];
        if (!Array.isArray(list)) return;
        // if (accountId < 0 || accountId >= list.length) return;
        console.log("Account list before removal:", list);
        // console.log("Existing account:", existingAccount);

        // remove by index
        const index = list.findIndex((acc: any) => acc.accountId === accountId);
        if (index === -1) return;
        list.splice(index, 1);

        console.log("Account list after removal:", list);
      });
    },

    saveUserDetails: (data: any) =>
      set((state) => {
        console.log("Payload data:", data);
        console.log("User before:", state.user);
        state.user = {
          ...state.user,
          ...data,
        };
        console.log("User after:", state.user);
      }),
  }))
);



/*
  initial user store to simulate user data
  const user: IUser = {
  firstName: "Ivan",
  lastName: "Creator",
  email: "ivan.creator@gmail.com",
  phone: "+380501234567",
  password: "Test1234!",
  logosUrl: "/2.jpg",
  telegram: "@ivan_creator",
  whatsapp: "+380501234567",
  instagram: [
    {
      username: "ivan.music",
      profileLink: "https://instagram.com/ivan.music",
      followers: 48200,
      logoUrl: "/2.jpg",
      profileCategory: "artist",
      price: 350,
      publicPrice: 400,
      currency: "EUR",
      initialPrice: 300,
      engagementRate: 4.8,
      averageViews: 12000,
      musicGenres: ["pop", "electronic"],
      creatorCategories: ["musician", "content-creator"],
      countries: ["UA", "PL", "DE"],
      categories: ["music", "lifestyle"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  tiktok: [
    {
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
      musicGenres: ["hip-hop", "trap"],
      creatorCategories: ["producer"],
      countries: ["UA", "US"],
      categories: ["music", "short-video"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  spotify: [
    {
      username: "Ivan Official",
      profileLink: "https://open.spotify.com/artist/123456",
      followers: 18200,
      logoUrl: "/2.jpg",
      profileCategory: "artist",
      price: 800,
      publicPrice: 900,
      currency: "EUR",
      initialPrice: 700,
      engagementRate: 3.1,
      averageViews: 0,
      musicGenres: ["pop", "indie"],
      creatorCategories: ["artist"],
      countries: ["UA", "FR", "IT"],
      categories: ["streaming"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  soundcloud: [
    {
      username: "ivan-music",
      profileLink: "https://soundcloud.com/ivan-music",
      followers: 9400,
      logoUrl: "/2.jpg",
      profileCategory: "artist",
      price: 150,
      publicPrice: 180,
      currency: "EUR",
      initialPrice: 120,
      engagementRate: 2.6,
      averageViews: 2300,
      musicGenres: ["lofi", "ambient"],
      creatorCategories: ["independent-artist"],
      countries: ["UA"],
      categories: ["music"],
      isHidden: false,
      isDeleted: false,
      isVerified: false,
    },
  ],
  facebook: [
    {
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
      creatorCategories: ["artist"],
      countries: ["UA", "RO"],
      categories: ["music", "community"],
      isHidden: false,
      isDeleted: false,
      isVerified: false,
    },
  ],
  youtube: [
    {
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
      musicGenres: ["pop", "live"],
      creatorCategories: ["musician", "youtuber"],
      countries: ["UA", "GB"],
      categories: ["music", "video"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  press: [
    {
      username: "Ivan Press Kit",
      profileLink: "https://press.example.com/ivan",
      followers: 0,
      logoUrl: "/2.jpg",
      profileCategory: "press",
      price: 1000,
      publicPrice: 1200,
      currency: "EUR",
      initialPrice: 900,
      engagementRate: 0,
      averageViews: 0,
      musicGenres: ["pop"],
      creatorCategories: ["artist"],
      countries: ["EU"],
      categories: ["press", "media"],
      isHidden: false,
      isDeleted: false,
      isVerified: true,
    },
  ],
  internalNote:
    "Top creator for music campaigns. Priority platforms: TikTok & YouTube.",
};
*/
