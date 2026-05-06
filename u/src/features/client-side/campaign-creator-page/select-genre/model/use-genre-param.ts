import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const GENRES = [
    {
        id: "Techno (Melodic, Minimal)",
        text: "Techno",
        subText: "Melodic, Minimal",
    },
    {
        id: "Techno (Hard, Peak)",
        text: "Techno",
        subText: "Hard, Peak",
    },
    {
        id: "House (Tech House)",
        text: "House",
        subText: "Tech House",
    },
    {
        id: "House (Melodic, Afro)",
        text: "House",
        subText: "Melodic, Afro",
    },
    {
        id: "EDM",
        text: "EDM",
        subText: "",
    },
    {
        id: "D&B",
        text: "D&B",
        subText: "",
    },
    {
        id: "Bass",
        text: "Bass",
        subText: "",
    },
    // {
    //     id: "Psy, Trance",
    //     text: "Psy,Trance",
    //     subText: "",
    // },
    // {
    //     id: "Trance",
    //     text: "Trance",
    //     subText: "",
    // },
    {
        id: "Dubstep",
        text: "Dubstep",
        subText: "",
    },
    // {
    //     id: "Dance Pop",
    //     text: "Pop",
    //     subText: "",
    // },
] as const;

export type GenreId = (typeof GENRES)[number]["id"];

export const DEFAULT_CAMPAIGN_CREATOR_GENRE: GenreId =
    "Techno (Melodic, Minimal)";

const ALLOWED_GENRES = GENRES.map((item) => item.id) as GenreId[];

export const useGenreParam = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const genre = useMemo<GenreId>(() => {
        const raw = searchParams.get("genre");
        if (!raw) return DEFAULT_CAMPAIGN_CREATOR_GENRE;

        return ALLOWED_GENRES.includes(raw as GenreId)
            ? (raw as GenreId)
            : DEFAULT_CAMPAIGN_CREATOR_GENRE;
    }, [searchParams]);

    const setGenre = (nextGenre: GenreId) => {
        const next = new URLSearchParams(searchParams);
        next.set("genre", nextGenre);
        setSearchParams(next, { replace: true });
    };

    return {
        genre,
        setGenre,
    };
};