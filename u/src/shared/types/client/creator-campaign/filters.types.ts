export type AndOrMethod = "And" | "Or";

export interface AndOrOption {
  method: string;
}

export interface FilterItem {
  group:
    | "socialMedia"
    | "countries"
    | "addTopics"
    | "genres"
    | "profileType"
    | "communityMusicGenres"
    | "communityThemeTopics"
    | "creatorMusicGenres"
    | "creatorContentFocus";
  id: string;
  filterName: string;
  count: number;
  apiTargets?: Partial<
    Record<
      | "communityMusicGenres"
      | "communityThemeTopics"
      | "creatorMusicGenres"
      | "creatorContentFocus",
      string[]
    >
  >;
  children?: FilterItem[];
}

export interface FilterData {
  id: string;
  title: string;
  AndOrFlag?: AndOrOption[];
  filters: FilterItem[];
}
