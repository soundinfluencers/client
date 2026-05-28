import ArtistIcon from "@/assets/tabs-bespoke-campaign/material-symbols_artist-outline.svg";
import MusicIcon from "@/assets/tabs-bespoke-campaign/hugeicons_apple-music.svg";
import EventIcon from "@/assets/tabs-bespoke-campaign/carbon_event.svg";
import OtherIcon from "@/assets/tabs-bespoke-campaign/icon-park-outline_other.svg";
import type {
    AgencyCampaignFormConfig,
    AgencyTabItem,
} from "./agency-campaign.types";

export const AGENCY_CAMPAIGN_TABS: AgencyTabItem[] = [
    { id: "artist", label: "Artist", icon: ArtistIcon },
    { id: "music", label: "Music", icon: MusicIcon },
    { id: "event", label: "Event", icon: EventIcon },
    { id: "other", label: "Other", icon: OtherIcon },
];

export const AGENCY_CAMPAIGN_FORM_CONFIGS: AgencyCampaignFormConfig[] = [
    {
        tabId: "artist",
        title: "Artist Promo Campaigns",
        fields: [
            {
                name: "Campaign objective",
                label: "Campaign objective",
                placeholder: "Enter tour, gig, branding push, announcement",
                required: true,
                type: "text",
            },
            {
                name: "Content available",
                label: "Content available",
                placeholder: "Enter links to your videos, press photos, artwork",
                required: true,
                type: "text",
            },
            {
                name: "Your budget",
                label: "Your budget",
                placeholder: "Enter your budget",
                required: true,
                type: "budget",
            },
            {
                name: "Target territories",
                label: "Target territories",
                placeholder: "Leave it empty for worldwide campaign",
                type: "text",
            },
            {
                name: "Any Extra Briefs",
                label: "Any Extra Briefs",
                placeholder:
                    "Enter here any details or ideas you'd like us to consider while designing your campaign",
                type: "textarea",
            },
        ],
    },
    {
        tabId: "music",
        title: "Music Promo Campaigns",
        fields: [
            {
                name: "Campaign objective",
                label: "Campaign objective",
                placeholder: "Enter tour, gig, branding push, announcement",
                required: true,
                type: "text",
            },
            {
                name: "Content available",
                label: "Content available",
                placeholder: "Enter links to your videos, press photos, artwork",
                required: true,
                type: "text",
            },
            {
                name: "Download or private link to the track",
                label: "Download or private link to the track",
                placeholder: "Download or private link to the track",
                type: "text",
            },
            {
                name: "Release date",
                label: "Release date",
                placeholder: "Enter release date",
                type: "text",
            },
            {
                name: "Enter linkfire / smartlink",
                label: "Linkfire / smartlink",
                placeholder: "Enter linkfire / smartlink",
                type: "text",
            },
            {
                name: "Your budget",
                label: "Your budget",
                placeholder: "Enter your budget",
                required: true,
                type: "budget",
            },
            {
                name: "Target territories",
                label: "Target territories",
                placeholder: "Enter target territories (leave it empty for worldwide campaign)",
                type: "text",
            },
            {
                name: "Any extra notes (messaging, influencer type, content ideas)",
                label: "Any extra notes (messaging, influencer type, content ideas)",
                placeholder: "Enter messaging, influencer type, content ideas",
                type: "textarea",
            },
        ],
    },
    {
        tabId: "event",
        title: "Event Promo Campaigns",
        fields: [
            {
                name: "What you’re promoting (Campaign Goal)",
                label: "What you’re promoting (Campaign Goal)",
                placeholder: "Enter tour, gig, branding push, announcement",
                required: true,
                type: "text",
            },
            {
                name: "Content available",
                label: "Content available",
                placeholder: "Enter links to your videos, press photos, artwork",
                required: true,
                type: "text",
            },
            {
                name: "Ticket link",
                label: "Ticket link",
                placeholder: "Enter ticket link",
                type: "text",
            },
            {
                name: "Your budget",
                label: "Your budget",
                placeholder: "Enter your budget",
                required: true,
                type: "budget",
            },
            {
                name: "Target territories",
                label: "Target territories",
                placeholder: "Enter target territories (leave it empty for worldwide campaign)",
                type: "text",
            },
            {
                name: "Any extra notes (messaging, influencer type, content ideas)",
                label: "Any extra notes (messaging, influencer type, content ideas)",
                placeholder: "Enter messaging, influencer type, content ideas",
                type: "textarea",
            },
        ],
    },
    {
        tabId: "other",
        title: "",
        fields: [
            {
                name: "Brief",
                label: "Brief",
                placeholder: "Enter brief here",
                required: true,
                type: "textarea",
                isBespoke: true,
            },
        ],
    },
];