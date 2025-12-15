import type { IBespokeCampaignTabData } from "../types/form/bespoke-campaign-tabs-data";

export const BESPOKE_CAMPAIGN_TABS_DATA: IBespokeCampaignTabData[] = [
  {
    formType: "bespoke",
    promoType: "Artist",
    title: "Artist Promo Campaigns",
    inputs: [
      {
        label: "What you’re promoting (tour, gig, branding push, announcement)",
        name: "Enter tour, gig, branding push, announcement",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Gig/tour details (dates, locations, lineups if needed)",
        name: "Gig/tour details (dates, locations, lineups if needed)",
        placeholder: "Enter dates, locations, lineups if needed",
      },
      {
        label: "Content available (videos, press photos, artwork)",
        name: "Content available (videos, press photos, artwork)",
        placeholder: "Enter videos, press photos, artwork",
      },
      {
        label: "Your budget",
        name: "Your budget",
        placeholder: "Enter your budget",
      },
      {
        label: "Target territories",
        name: "Target territories",
        placeholder:
          "Enter target territories (leave it empty for worldwide campaign)",
      },
      {
        label: "Any extra notes (messaging, influencer type, content ideas)",
        name: "Any extra notes (messaging, influencer type, content ideas)",
        placeholder: "Enter messaging, influencer type, content ideas",
      },
    ],
  },
  {
    formType: "bespoke",
    promoType: "Music",
    title: "Music Promo Campaigns",
    inputs: [
      {
        label: "What you’re promoting (tour, gig, branding push, announcement)",
        name: "Enter tour, gig, branding push, announcement",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Gig/tour details (dates, locations, lineups if needed)",
        name: "Gig/tour details (dates, locations, lineups if needed)",
        placeholder: "Enter dates, locations, lineups if needed",
      },
      {
        label: "Content available (videos, press photos, artwork)",
        name: "Content available (videos, press photos, artwork)",
        placeholder: "Enter videos, press photos, artwork",
      },
      {
        label: "Your budget",
        name: "Your budget",
        placeholder: "Enter your budget",
      },
      {
        label: "Target territories",
        name: "Target territories",
        placeholder:
          "Enter target territories (leave it empty for worldwide campaign)",
      },
      {
        label: "Any extra notes (messaging, influencer type, content ideas)",
        name: "Any extra notes (messaging, influencer type, content ideas)",
        placeholder: "Enter messaging, influencer type, content ideas",
      },
    ],
  },
  {
    formType: "bespoke",
    promoType: "Event",
    title: "Event Promo Campaigns",
    inputs: [
      {
        label: "What you’re promoting (tour, gig, branding push, announcement)",
        name: "Enter tour, gig, branding push, announcement",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Gig/tour details (dates, locations, lineups if needed)",
        name: "Gig/tour details (dates, locations, lineups if needed)",
        placeholder: "Enter dates, locations, lineups if needed",
      },
      {
        label: "Content available (videos, press photos, artwork)",
        name: "Content available (videos, press photos, artwork)",
        placeholder: "Enter videos, press photos, artwork",
      },
      {
        label: "Your budget",
        name: "Your budget",
        placeholder: "Enter your budget",
      },
      {
        label: "Target territories",
        name: "Target territories",
        placeholder:
          "Enter target territories (leave it empty for worldwide campaign)",
      },
      {
        label: "Any extra notes (messaging, influencer type, content ideas)",
        name: "Any extra notes (messaging, influencer type, content ideas)",
        placeholder: "Enter messaging, influencer type, content ideas",
      },
    ],
  },
  {
    formType: "bespoke",
    promoType: "Other",
    title: "",
    inputs: [],
    textAreas: [
      {
        name: "Brief",
        placeholder: "Enter brief here",
      },
    ],
  },
];
