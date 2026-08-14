import { getSocialMediaIcon } from "@/constants/social-medias";
import type {
    BundleAccountDisplayModel,
    BundleCardDisplayModel,
} from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card.types";
import type {
    SocialMediaType,
} from "@/types/utils/constants.types";

const GENRES = [
    { key: "techno", label: "Techno (All)" },
    { key: "psy", label: "Psy" },
    { key: "house", label: "House (All)" },
    { key: "bass", label: "Bass" },
    { key: "dubstep", label: "Dubstep" },
    { key: "edm", label: "EDM" },
    { key: "drum-and-bass", label: "D&B" },
] as const;

const COUNTRIES = [
    { key: "US-16.5", label: "US 16.5%" },
    { key: "Brazil-8", label: "Brazil 8%" },
    { key: "Italy-6.4", label: "Italy 6.4%" },
    { key: "India-5.8", label: "India 5.8%" },
    { key: "UK-5.3", label: "UK 5.3%" },
] as const;

const createAccount = ({
    accountId,
    username,
    socialMedia,
    followersLabel,
}: {
    accountId: string;
    username: string;
    socialMedia: SocialMediaType;
    followersLabel: string;
}): BundleAccountDisplayModel => ({
    accountId,
    username,
    platformIcon: getSocialMediaIcon(socialMedia),
    platformLabel: socialMedia,
    followersLabel,
    priceLabel: "500€",
    genres: GENRES,
    countries: COUNTRIES,
});

const createFixtureAccounts = (
    bundleId: string,
): readonly BundleAccountDisplayModel[] => [
    createAccount({
        accountId: `${bundleId}-techno-fraternity`,
        username: "Techno Fraternity",
        socialMedia: "youtube",
        followersLabel: "268K",
    }),
    createAccount({
        accountId: `${bundleId}-groove-bassment`,
        username: "Groove Bassment",
        socialMedia: "facebook",
        followersLabel: "1.1M",
    }),
    createAccount({
        accountId: `${bundleId}-techno-tv`,
        username: "Techno TV",
        socialMedia: "soundcloud",
        followersLabel: "1.1M",
    }),
];

const createBundleFixture = (bundleId: string): BundleCardDisplayModel => ({
    bundleId,
    followersLabel: "1.1M",
    accounts: createFixtureAccounts(bundleId),
    originalPriceLabel: "1500€",
    priceLabel: "1200€",
});

// Temporary visual-QA data. Replaced by mapped Bundle query data in the next stage.
export const BUNDLE_CATALOG_FIXTURES: readonly BundleCardDisplayModel[] = [
    createBundleFixture("bundle-fixture-1"),
    createBundleFixture("bundle-fixture-2"),
    createBundleFixture("bundle-fixture-3"),
];
