import type {
    CampaignApiTargetGroup,
    CampaignApiTargets,
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "../model/campaign-filter.types";
import type {
    CampaignFilterItemDto,
    CampaignFilterSectionDto,
} from "../api/campaign-filter.dto";

const mapMethod = (value: string): CampaignFilterMethod | null => {
    const normalized = value.toLowerCase();

    if (normalized === "and") return "and";
    if (normalized === "or") return "or";

    return null;
};

const toSafeFilterId = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[()]/g, "")
        .replace(/,/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const TARGET_GROUPS = [
    "communityMusicGenres",
    "communityThemeTopics",
    "creatorMusicGenres",
    "creatorContentFocus",
] as const satisfies readonly CampaignApiTargetGroup[];

const isTargetGroup = (value: string): value is CampaignApiTargetGroup =>
    TARGET_GROUPS.includes(value as CampaignApiTargetGroup);

const addTarget = (
    targets: CampaignApiTargets | undefined,
    group: CampaignApiTargetGroup,
    value: string,
): CampaignApiTargets => {
    const next = { ...(targets ?? {}) };
    const values = next[group] ?? [];

    if (!values.includes(value)) {
        next[group] = [...values, value];
    }

    return next;
};

type GenreUiConfig = {
    id: string;
    label: string;
    parentId?: string;
    parentLabel?: string;
};

const GENRE_UI_BY_VALUE: Record<string, GenreUiConfig> = {
    techno_melodic_minimal: {
        id: "techno_melodic_minimal",
        label: "Melodic, Minimal",
        parentId: "techno",
        parentLabel: "Techno",
    },
    electronic_techno_melodic_minimal: {
        id: "techno_melodic_minimal",
        label: "Melodic, Minimal",
        parentId: "techno",
        parentLabel: "Techno",
    },
    techno_hard_peak: {
        id: "techno_hard_peak",
        label: "Hard, Peak",
        parentId: "techno",
        parentLabel: "Techno",
    },
    electronic_techno_hard_peak: {
        id: "techno_hard_peak",
        label: "Hard, Peak",
        parentId: "techno",
        parentLabel: "Techno",
    },
    house_tech_house: {
        id: "house_tech_house",
        label: "Tech House",
        parentId: "house",
        parentLabel: "House",
    },
    electronic_house_tech_house: {
        id: "house_tech_house",
        label: "Tech House",
        parentId: "house",
        parentLabel: "House",
    },
    house_melodic_afro: {
        id: "house_melodic_afro",
        label: "Melodic, Afro",
        parentId: "house",
        parentLabel: "House",
    },
    electronic_house_melodic_afro: {
        id: "house_melodic_afro",
        label: "Melodic, Afro",
        parentId: "house",
        parentLabel: "House",
    },
    edm: { id: "edm", label: "EDM" },
    electronic_edm: { id: "edm", label: "EDM" },
    drum_and_bass: { id: "drum_and_bass", label: "D&B" },
    electronic_drum_and_bass: { id: "drum_and_bass", label: "D&B" },
    bass: { id: "bass", label: "Bass" },
    electronic_bass: { id: "bass", label: "Bass" },
    psy_trance: { id: "psy_trance", label: "Psy, Trance" },
    electronic_psy_trance: { id: "psy_trance", label: "Psy, Trance" },
    dubstep: { id: "dubstep", label: "Dubstep" },
    electronic_dubstep: { id: "dubstep", label: "Dubstep" },
    hip_hop: { id: "hip_hop", label: "Hip-hop" },
    mainstream_hip_hop: { id: "hip_hop", label: "Hip-hop" },
    pop: { id: "pop", label: "Pop" },
    mainstream_pop: { id: "pop", label: "Pop" },
    mainstream_arabic: { id: "arabic", label: "Arabic" },
    mainstream_k_pop: { id: "k_pop", label: "K-Pop" },
    mainstream_metal_rock: { id: "metal_rock", label: "Metal/Rock" },
    mainstream_latin: { id: "latin", label: "Latin" },
};

const GENRE_ORDER = [
    "techno",
    "house",
    "edm",
    "drum_and_bass",
    "bass",
    "psy_trance",
    "dubstep",
    "hip_hop",
    "pop",
    "arabic",
    "k_pop",
    "metal_rock",
    "latin",
];

const GENRE_CHILD_ORDER: Record<string, string[]> = {
    techno: ["techno_melodic_minimal", "techno_hard_peak"],
    house: ["house_tech_house", "house_melodic_afro"],
};

const sortByOrder = <T extends { id: string }>(items: T[], order: string[]): T[] =>
    [...items].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);

        return (
            (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
                (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex) ||
            a.id.localeCompare(b.id)
        );
    });

export const mapCampaignFilterItemDto = (
    dto: CampaignFilterItemDto,
): CampaignFilterItem => {
    const raw = String(dto.id ?? "");

    return {
        id: toSafeFilterId(raw),
        rawId: raw,
        apiValue: raw,
        group: String(dto.group ?? ""),
        filterName: String(dto.filterName ?? ""),
        count: Number(dto.count ?? 0),
        apiTargets: dto.apiTargets,
        children: dto.children?.map(mapCampaignFilterItemDto),
    };
};

export const mapCampaignFilterSectionDto = (
    dto: CampaignFilterSectionDto,
): CampaignFilterSection => ({
    id: String(dto.id),
    title: String(dto.title),
    methods: (dto.AndOrFlag ?? [])
        .map((item) => mapMethod(item.method))
        .filter(Boolean) as CampaignFilterMethod[],
    filters: (dto.filters ?? []).map(mapCampaignFilterItemDto),
});

const cloneSectionAsDto = (section: CampaignFilterSectionDto): CampaignFilterSectionDto => ({
    ...section,
    filters: (section.filters ?? []).map((item) => ({
        ...item,
        children: item.children?.map((child) => ({ ...child })),
    })),
});

const createMusicGenresSectionDto = (
    sections: CampaignFilterSectionDto[],
): CampaignFilterSectionDto | null => {
    const sourceItems = sections.flatMap((section) =>
        (section.filters ?? []).filter((item) =>
            ["communityMusicGenres", "creatorMusicGenres"].includes(item.group),
        ),
    );

    if (!sourceItems.length) return null;

    const parents = new Map<string, CampaignFilterItemDto>();
    const flats = new Map<string, CampaignFilterItemDto>();

    sourceItems.forEach((item) => {
        if (!isTargetGroup(item.group)) return;

        const config = GENRE_UI_BY_VALUE[item.id] ?? {
            id: item.id,
            label: item.filterName,
        };

        if (config.parentId && config.parentLabel) {
            const parent =
                parents.get(config.parentId) ??
                ({
                    id: config.parentId,
                    group: "genres",
                    filterName: config.parentLabel,
                    count: 0,
                    apiTargets: {},
                    children: [],
                } satisfies CampaignFilterItemDto);

            const children = parent.children ?? [];
            const existingChild = children.find((child) => child.id === config.id);
            const child =
                existingChild ??
                ({
                    id: config.id,
                    group: "genres",
                    filterName: config.label,
                    count: 0,
                    apiTargets: {},
                } satisfies CampaignFilterItemDto);

            child.count += item.count;
            child.apiTargets = addTarget(child.apiTargets, item.group, item.id);

            if (!existingChild) {
                parent.children = [...children, child];
            }

            parent.count += item.count;
            parent.apiTargets = addTarget(parent.apiTargets, item.group, item.id);
            parents.set(config.parentId, parent);
            return;
        }

        const existing = flats.get(config.id);
        const next =
            existing ??
            ({
                id: config.id,
                group: "genres",
                filterName: config.label,
                count: 0,
                apiTargets: {},
            } satisfies CampaignFilterItemDto);

        next.count += item.count;
        next.apiTargets = addTarget(next.apiTargets, item.group, item.id);
        flats.set(config.id, next);
    });

    parents.forEach((parent) => {
        parent.children = sortByOrder(
            parent.children ?? [],
            GENRE_CHILD_ORDER[parent.id] ?? [],
        );
    });

    const filters = GENRE_ORDER.flatMap((id) => {
        const parent = parents.get(id);
        if (parent) return [parent];

        const flat = flats.get(id);
        return flat ? [flat] : [];
    });

    const remaining = [...parents.values(), ...flats.values()].filter(
        (item) => !GENRE_ORDER.includes(item.id),
    );

    return {
        id: "music-genre",
        title: "Music Genres",
        AndOrFlag: [{ method: "And" }, { method: "Or" }],
        filters: [...filters, ...remaining],
    };
};

const createAdditionalTopicsSectionDto = (
    sections: CampaignFilterSectionDto[],
): CampaignFilterSectionDto | null => {
    const sourceItems = sections.flatMap((section) =>
        (section.filters ?? []).filter((item) =>
            ["communityThemeTopics", "creatorContentFocus"].includes(item.group),
        ),
    );

    if (!sourceItems.length) return null;

    const topics = new Map<string, CampaignFilterItemDto>();

    sourceItems.forEach((item) => {
        if (!isTargetGroup(item.group)) return;

        const id = toSafeFilterId(item.filterName || item.id);
        const existing = topics.get(id);
        const next =
            existing ??
            ({
                id,
                group: "addTopics",
                filterName: item.filterName,
                count: 0,
                apiTargets: {},
            } satisfies CampaignFilterItemDto);

        next.count += item.count;
        next.apiTargets = addTarget(next.apiTargets, item.group, item.id);
        topics.set(id, next);
    });

    return {
        id: "additional-topics",
        title: "Additional Topics",
        filters: [...topics.values()],
    };
};

export const mapCampaignFilterSectionsToLegacyDto = (
    sections: CampaignFilterSectionDto[],
): CampaignFilterSectionDto[] => {
    const hasNewTaxonomySections = sections.some((section) =>
        [
            "community-music-genres",
            "creator-music-genres",
            "community-theme-topics",
            "creator-content-focus",
        ].includes(section.id),
    );

    if (!hasNewTaxonomySections) {
        return sections.map(cloneSectionAsDto);
    }

    const socialPlatforms = sections.find((section) => section.id === "social-platforms-1");
    const profileTypes = sections.find((section) => section.id === "profile-type");
    const countries = sections.find((section) => section.id === "countries");
    const musicGenres = createMusicGenresSectionDto(sections);
    const additionalTopics = createAdditionalTopicsSectionDto(sections);

    return [
        socialPlatforms && cloneSectionAsDto(socialPlatforms),
        profileTypes && cloneSectionAsDto(profileTypes),
        musicGenres,
        countries && cloneSectionAsDto(countries),
        additionalTopics,
    ].filter(Boolean) as CampaignFilterSectionDto[];
};

export const mapCampaignFilterSectionsDto = (
    sections: CampaignFilterSectionDto[],
): CampaignFilterSection[] =>
    mapCampaignFilterSectionsToLegacyDto(sections).map(mapCampaignFilterSectionDto);
