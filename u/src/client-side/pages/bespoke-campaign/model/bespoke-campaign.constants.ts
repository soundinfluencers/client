import ArtistIcon from "@/assets/tabs-bespoke-campaign/material-symbols_artist-outline.svg";
import MusicIcon from "@/assets/tabs-bespoke-campaign/hugeicons_apple-music.svg";
import EventIcon from "@/assets/tabs-bespoke-campaign/carbon_event.svg";
import OtherIcon from "@/assets/tabs-bespoke-campaign/icon-park-outline_other.svg";
import type {
    BespokeCampaignTabData,
    BespokeTabItem
} from "@/client-side/pages/bespoke-campaign/model/bespoke-сampaign.types.ts";



export const BESPOKE_CAMPAIGN_TABS: BespokeTabItem[] = [
    { id: "Artist", label: "Artist", icon: ArtistIcon },
    { id: "Music", label: "Music", icon: MusicIcon },
    { id: "Event", label: "Event", icon: EventIcon },
    { id: "Other", label: "Other", icon: OtherIcon },
];

export const BESPOKE_CAMPAIGN_TABS_DATA: BespokeCampaignTabData[] = [
    {
        formType: "bespoke",
        promoType: "Artist",
        title: "Artist Promo Campaigns",
        inputs: [
            {
                label: "Campaign objective",
                name: "Campaign objective",
                placeholder: "Enter tour, gig, branding push, announcement ",
            },
            {
                label: "Content available*",
                name: "Content available",
                placeholder: "Enter links to your videos, press photos, artwork",
            },
            {
                label: "Your budget*",
                name: "Your budget",
                placeholder: "Enter your budget",
            },
            {
                label: "Target territories",
                name: "Target territories",
                placeholder: "Leave it empty for worldwide campaign",
            },
        ],
        textAreas: [
            {
                label: "Any Extra Briefs",
                name: "Any Extra Briefs",
                placeholder:
                    "Enter here any details or ideas you'd like us to consider while designing your campaign",
            },
        ],
    },
    {
        formType: "bespoke",
        promoType: "Music",
        title: "Music Promo Campaigns",
        inputs: [
            {
                label: "Campaign objective",
                name: "Campaign objective",
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
                label: "Your budget*",
                name: "Your budget",
                placeholder: "Enter your budget",
            },
            {
                label: "Target territories",
                name: "Target territories",
                placeholder:
                    "Enter target territories (leave it empty for worldwide campaign)",
            },
        ],
        textAreas: [
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
                label: "Campaign objective",
                name: "Campaign objective",
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
                label: "Your budget*",
                name: "Your budget",
                placeholder: "Enter your budget",
            },
            {
                label: "Target territories",
                name: "Target territories",
                placeholder:
                    "Enter target territories (leave it empty for worldwide campaign)",
            },
        ],
        textAreas: [
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