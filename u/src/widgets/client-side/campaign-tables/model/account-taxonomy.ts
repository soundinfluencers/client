import { MUSIC_GENRES_COMMUNITY, MUSIC_GENRES_CREATOR } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/music-genres.data";
import { THEME_TOPICS } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/categories.data";
import { CONTENT_FOCUS_OPTIONS } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/creator-categories.data";
import type { SelectedCampaignAccount } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

type Option = { value: string; label: string; children?: Option[] };
const labels = (options: Option[]): Map<string, string> => new Map(options.flatMap((option): [string, string][] => [
    [option.value, option.label], ...Array.from(labels(option.children ?? [])),
]));
const communityGenres = labels(MUSIC_GENRES_COMMUNITY);
const creatorGenres = labels(MUSIC_GENRES_CREATOR);
const topics = labels(THEME_TOPICS);
const focus = labels(CONTENT_FOCUS_OPTIONS);
const display = (values: readonly string[], lookup: Map<string, string>) => values.map((value) => ({ value, label: lookup.get(value) ?? value }));

type AccountTaxonomy = Pick<SelectedCampaignAccount, "profileType" | "genres" |
    "communityMusicGenres" | "communityThemeTopics" | "creatorMusicGenres" | "creatorContentFocus">;

// Display only: never replace the byte-for-byte enum values in account state/payload.
export const getAccountTaxonomyGroups = (account: AccountTaxonomy) => {
    const creator = account.profileType === "creator";
    return [
        { title: "Music genres", items: display((creator ? account.creatorMusicGenres : account.communityMusicGenres) ?? account.genres ?? [], creator ? creatorGenres : communityGenres) },
        { title: creator ? "Content focus" : "Topics", items: display((creator ? account.creatorContentFocus : account.communityThemeTopics) ?? [], creator ? focus : topics) },
    ].filter((group) => group.items.length);
};

// Cards use only profile-specific arrays; Strategy keeps its existing legacy fallback/groups.
export const getAccountCardTaxonomy = (account: Omit<AccountTaxonomy, "genres">) => ({
    title: account.profileType === "creator" ? "Content genre" : "Music genre",
    items: getAccountTaxonomyGroups({ ...account, genres: [] }).flatMap((group) => group.items),
});

// Disclosure-only blocks. Keep the flat catalogue list and Strategy titles unchanged.
export const getAccountCardTaxonomyGroups = (account: Omit<AccountTaxonomy, "genres">) =>
    getAccountTaxonomyGroups({ ...account, genres: [] }).map((group) => ({
        ...group,
        title: group.title === "Music genres" ? "Music Genre"
            : account.profileType === "creator" ? "Content Focus" : "Theme Topic",
    }));
