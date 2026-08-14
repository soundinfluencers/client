// Canonical labels mirror the Account Setup dictionaries in:
// pages/influencer/components/account-setup-form/components/checkbox-button-list/data.
// They live locally to keep the Bundle entity independent from the pages layer.
const CAMPAIGN_CATEGORY_LABELS: Readonly<Record<string, string>> = {
    techno: "Techno",
    techno_melodic_minimal: "Melodic, Minimal",
    techno_hard_peak: "Hard, Peak",
    house: "House",
    house_tech_house: "Tech House",
    house_melodic_afro: "Melodic, Afro",
    edm: "EDM",
    drum_and_bass: "D&B",
    bass: "Bass",
    psy_trance: "Psy, Trance",
    dubstep: "Dubstep",
    hip_hop: "Hip-hop",
    pop: "Pop",

    ibiza: "Ibiza",
    dancing: "Dancing",
    meme: "Meme",

    electronic_music: "Electronic Music",
    electronic_techno_melodic_minimal: "Melodic, Minimal",
    electronic_techno_hard_peak: "Hard, Peak",
    electronic_house_tech_house: "Tech House",
    electronic_house_melodic_afro: "Melodic, Afro",
    electronic_edm: "EDM",
    electronic_drum_and_bass: "D&B",
    electronic_bass: "Bass",
    electronic_psy_trance: "Psy, Trance",
    electronic_dubstep: "Dubstep",
    mainstream_music: "Mainstream Music",
    mainstream_pop: "Pop",
    mainstream_hip_hop: "Hip-hop",
    mainstream_arabic: "Arabic",
    mainstream_k_pop: "K-Pop",
    mainstream_metal_rock: "Metal/Rock",
    mainstream_latin: "Latin",

    music: "Music",
    music_dance: "Dance",
    music_lipsync: "Lipsync",
    music_reactions: "Reactions",
    music_lyrics: "Lyrics",
    entertainment: "Entertainment",
    entertainment_lifestyle: "Lifestyle",
    entertainment_fashion: "Fashion",
    entertainment_fitness_sport: "Fitness/Sport",
    entertainment_beauty: "Beauty",
    entertainment_travel: "Travel",
    entertainment_family: "Family",
    entertainment_comedy: "Comedy",
    entertainment_cosplay: "Cosplay",
    entertainment_food: "Food",
    entertainment_art: "Art",
};

export const formatUnknownCampaignCategory = (value: string): string => {
    const words = value
        .trim()
        .split("_")
        .filter(Boolean)
        .map(
            (word) =>
                `${word.charAt(0).toUpperCase()}${word
                    .slice(1)
                    .toLowerCase()}`,
        );

    return words.join(" ") || value;
};

export const getCampaignCategoryLabel = (value: string): string =>
    CAMPAIGN_CATEGORY_LABELS[value] ??
    formatUnknownCampaignCategory(value);
