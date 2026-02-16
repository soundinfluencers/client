import type { IBespokeCampaignTabData } from "@/shared/types/client/form-clients/bespoke-campaign-tabs-data";

export const BESPOKE_CAMPAIGN_TABS_DATA: IBespokeCampaignTabData[] = [
  {
    formType: "bespoke",
    promoType: "Artist",
    title: "Artist Promo Campaigns",
    inputs: [
      {
        label: "What you’re promoting (Campaign Goal)",
        name: "What you’re promoting (Campaign Goal)",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Content available ",
        name: "Content available",
        placeholder: "Enter links to your videos, press photos, artwork",
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
        label: "What you’re promoting (Campaign Goal)",
        name: "What you’re promoting (Campaign Goal)",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Content available",
        name: "Content available",
        placeholder: "Enter links to your videos, press photos, artwork",
      },
      {
        label: "Download or private link to the track",
        name: "Download or private link to the track",
        placeholder: "Download or private link to the track",
      },
      {
        label: "Release date",
        name: "Release date",
        placeholder: "Enter release date",
      },
      {
        label: "Linkfire / smartlink",
        name: "Enter linkfire / smartlink",
        placeholder: "Enter release date",
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
        label: "What you’re promoting (Campaign Goal)",
        name: "What you’re promoting (Campaign Goal)",
        placeholder: "Enter tour, gig, branding push, announcement ",
      },
      {
        label: "Content available",
        name: "Content available",
        placeholder: "Enter links to your videos, press photos, artwork",
      },
      {
        label: "Ticket link",
        name: "Ticket link",
        placeholder: "Enter ticket link",
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
