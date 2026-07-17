import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
    PlatformKey
} from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param.ts";

export const GENRES = [
    {
        id: "techno_melodic_minimal",
        text: "Techno",
        subText: "Melodic, Minimal",
    },
    {
        id: "techno_hard_peak",
        text: "Techno",
        subText: "Hard, Peak",
    },
    {
        id: "house_tech_house",
        text: "House",
        subText: "Tech House",
    },
    {
        id: "house_melodic_afro",
        text: "House",
        subText: "Melodic, Afro",
    },
    {
        id: "edm",
        text: "EDM",
        subText: "",
    },
    {
        id: "drum_and_bass",
        text: "D&B",
        subText: "",
    },
    {
        id: "bass",
        text: "Bass",
        subText: "",
    },
    {
        id: "psy_trance",
        text: "Psy",
        subText: "",
    },
    {
        id: "dubstep",
        text: "Dubstep",
        subText: "",
    },
    {
        id: "hip_hop",
        text: "Hip-hop",
        subText: "",
    },
    {
        id: "pop",
        text: "Pop",
        subText: "",
    },
] as const;

export const CREATOR_GENRES = [
    {
        id: "electronic_techno_melodic_minimal",
        text: "Techno",
        subText: "Melodic, Minimal",
    },
    {
        id: "electronic_techno_hard_peak",
        text: "Techno",
        subText: "Hard, Peak",
    },
    {
        id: "electronic_house_tech_house",
        text: "House",
        subText: "Tech House",
    },
    {
        id: "electronic_house_melodic_afro",
        text: "House",
        subText: "Melodic, Afro",
    },
    {
        id: "electronic_edm",
        text: "EDM",
        subText: "",
    },
    {
        id: "electronic_drum_and_bass",
        text: "D&B",
        subText: "",
    },
    {
        id: "electronic_bass",
        text: "Bass",
        subText: "",
    },
    {
        id: "electronic_psy_trance",
        text: "Psy",
        subText: "",
    },
    {
        id: "electronic_dubstep",
        text: "Dubstep",
        subText: "",
    },
    {
        id: "mainstream_hip_hop",
        text: "Hip-hop",
        subText: "",
    },
    {
        id: "mainstream_pop",
        text: "Pop",
        subText: "",
    },
    {
        id: "mainstream_arabic",
        text: "Arabic",
        subText: "",
    },
    {
        id: "mainstream_k_pop",
        text: "K-Pop",
        subText: "",
    },
    {
        id: "mainstream_metal_rock",
        text: "Metal/Rock",
        subText: "",
    },
    {
        id: "mainstream_latin",
        text: "Latin",
        subText: "",
    },
] as const;

export type CommunityGenreId = (typeof GENRES)[number]["id"];

export type CreatorGenreId = (typeof CREATOR_GENRES)[number]["id"];

export type GenreId = CommunityGenreId | CreatorGenreId;

export type GenreOption =
  | (typeof GENRES)[number]
  | (typeof CREATOR_GENRES)[number];

export const DEFAULT_COMMUNITY_GENRE: CommunityGenreId =
  "techno_melodic_minimal";

export const DEFAULT_CREATOR_GENRE: CreatorGenreId =
  "electronic_techno_melodic_minimal";

export const getGenresByPlatform = (
  platform: PlatformKey,
): readonly GenreOption[] => {
    return platform === "tiktok_creators"
      ? CREATOR_GENRES
      : GENRES;
};

export const getDefaultGenreByPlatform = (
  platform: PlatformKey,
): GenreId => {
    return platform === "tiktok_creators"
      ? DEFAULT_CREATOR_GENRE
      : DEFAULT_COMMUNITY_GENRE;
};

export const isGenreAllowedForPlatform = (
  value: string,
  platform: PlatformKey,
): value is GenreId => {
    return getGenresByPlatform(platform).some(
      (genre) => genre.id === value,
    );
};

// const ALLOWED_GENRES = GENRES.map((item) => item.id) as GenreId[];

export const useGenreParam = (platform: PlatformKey) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const genre = useMemo<GenreId>(() => {
        const rawGenre = searchParams.get("genre");

        if (
          rawGenre &&
          isGenreAllowedForPlatform(rawGenre, platform)
        ) {
            return rawGenre;
        }

        return getDefaultGenreByPlatform(platform);
    }, [searchParams, platform]);

    const setGenre = (nextGenre: GenreId) => {
        if (!isGenreAllowedForPlatform(nextGenre, platform)) {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);

        nextSearchParams.set("genre", nextGenre);

        setSearchParams(nextSearchParams, {
            replace: true,
        });
    };

    return {
        genre,
        setGenre,
    };
};
