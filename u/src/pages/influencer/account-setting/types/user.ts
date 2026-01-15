//set all field for account optional
// type ClientId = string;

export interface IUser {
  // _cid?: ClientId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  logosUrl?: string | null;
  telegram?: string;
  whatsapp?: string;
  instagram: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country: string;
      percentage: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  tiktok: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country: string;
      percentage: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  spotify: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country: string;
      percentage: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  soundcloud: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country: string;
      percentage: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  facebook: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country?: string;
      percentage?: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  youtube: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country?: string;
      percentage?: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  press: {
    username?: string;
    profileLink?: string;
    followers?: number;
    logoUrl?: string | null;
    profileCategory?: string;
    price?: number;
    publicPrice?: number;
    currency?: string;
    initialPrice?: number;
    engagementRate?: number;
    averageViews?: number;
    musicGenres?: string[];
    creatorCategories?: string[];
    countries?: {
      country?: string;
      percentage?: number;
    }[];
    categories?: string[];
    isHidden?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  }[];
  internalNote: string;
}

// interface IAccount {
//   username: string;
//   profileLink: string;
//   followers: number;
//   logoUrl: string;
//   profileCategory?: 'community' | 'creator';
//   price: number;
//   currency: 'EUR';
//   musicGenres: string[];
//   creatorCategories: string[];
//   countries?: {
//     country?: string;
//     percentage?: number;
//   }[];

//   // countries: string[];
//   categories?: string[];
//   averageViews?: number;
//   engagementRate?: number;
//   publicPrice?: number;
//   initialPrice?: number;
// }

// export const user: IUser = {
//   firstName: "Ivan",
//   lastName: "Creator",
//   email: "ivan.creator@gmail.com",
//   phone: "+380501234567",
//   password: "Test1234!",
//   logosUrl: "/2.jpg",
//   telegram: "@ivan_creator",
//   whatsapp: "+380501234567",
//   instagram: [
//     {
//       username: "ivan.music",
//       profileLink: "https://instagram.com/ivan.music",
//       followers: 48200,
//       logoUrl: "/2.jpg",
//       profileCategory: "artist",
//       price: 350,
//       publicPrice: 400,
//       currency: "EUR",
//       initialPrice: 300,
//       engagementRate: 4.8,
//       averageViews: 12000,
//       musicGenres: ["pop", "electronic"],
//       creatorCategories: ["musician", "content-creator"],
//       countries: ["UA", "PL", "DE"],
//       categories: ["music", "lifestyle"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: true,
//     },
//   ],
//   tiktok: [
//     {
//       username: "ivanbeats",
//       profileLink: "https://tiktok.com/@ivanbeats",
//       followers: 153000,
//       logoUrl: "/2.jpg",
//       profileCategory: "creator",
//       price: 500,
//       publicPrice: 550,
//       currency: "EUR",
//       initialPrice: 450,
//       engagementRate: 7.2,
//       averageViews: 56000,
//       musicGenres: ["hip-hop", "trap"],
//       creatorCategories: ["producer"],
//       countries: ["UA", "US"],
//       categories: ["music", "short-video"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: true,
//     },
//   ],
//   spotify: [
//     {
//       username: "Ivan Official",
//       profileLink: "https://open.spotify.com/artist/123456",
//       followers: 18200,
//       logoUrl: "/2.jpg",
//       profileCategory: "artist",
//       price: 800,
//       publicPrice: 900,
//       currency: "EUR",
//       initialPrice: 700,
//       engagementRate: 3.1,
//       averageViews: 0,
//       musicGenres: ["pop", "indie"],
//       creatorCategories: ["artist"],
//       countries: ["UA", "FR", "IT"],
//       categories: ["streaming"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: true,
//     },
//   ],
//   soundcloud: [
//     {
//       username: "ivan-music",
//       profileLink: "https://soundcloud.com/ivan-music",
//       followers: 9400,
//       logoUrl: "/2.jpg",
//       profileCategory: "artist",
//       price: 150,
//       publicPrice: 180,
//       currency: "EUR",
//       initialPrice: 120,
//       engagementRate: 2.6,
//       averageViews: 2300,
//       musicGenres: ["lofi", "ambient"],
//       creatorCategories: ["independent-artist"],
//       countries: ["UA"],
//       categories: ["music"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: false,
//     },
//   ],
//   facebook: [
//     {
//       username: "Ivan Music Page",
//       profileLink: "https://facebook.com/ivanmusicpage",
//       followers: 8700,
//       logoUrl: "/2.jpg",
//       profileCategory: "community",
//       price: 120,
//       publicPrice: 150,
//       currency: "EUR",
//       initialPrice: 100,
//       engagementRate: 1.9,
//       averageViews: 1800,
//       musicGenres: ["pop"],
//       creatorCategories: ["artist"],
//       countries: ["UA", "RO"],
//       categories: ["music", "community"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: false,
//     },
//   ],
//   youtube: [
//     {
//       username: "Ivan Music Channel",
//       profileLink: "https://youtube.com/@ivanmusic",
//       followers: 62300,
//       logoUrl: "/2.jpg",
//       profileCategory: "creator",
//       price: 650,
//       publicPrice: 700,
//       currency: "EUR",
//       initialPrice: 600,
//       engagementRate: 5.4,
//       averageViews: 24000,
//       musicGenres: ["pop", "live"],
//       creatorCategories: ["musician", "youtuber"],
//       countries: ["UA", "GB"],
//       categories: ["music", "video"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: true,
//     },
//   ],
//   press: [
//     {
//       username: "Ivan Press Kit",
//       profileLink: "https://press.example.com/ivan",
//       followers: 0,
//       logoUrl: "/2.jpg",
//       profileCategory: "press",
//       price: 1000,
//       publicPrice: 1200,
//       currency: "EUR",
//       initialPrice: 900,
//       engagementRate: 0,
//       averageViews: 0,
//       musicGenres: ["pop"],
//       creatorCategories: ["artist"],
//       countries: ["EU"],
//       categories: ["press", "media"],
//       isHidden: false,
//       isDeleted: false,
//       isVerified: true,
//     },
//   ],
//   internalNote:
//     "Top creator for music campaigns. Priority platforms: TikTok & YouTube.",
// };
