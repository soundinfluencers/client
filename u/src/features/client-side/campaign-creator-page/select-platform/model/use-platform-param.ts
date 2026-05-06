import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const PLATFORMS = [
    { key: "instagram", id: "instagram", label: "Instagram", icon: "instagram" },
    { key: "tiktok-creators", id: "tiktok", label: "TikTok Creators", icon: "tiktok" },
    { key: "tiktok-communities", id: "tiktok", label: "TikTok Communities", icon: "tiktok" },
    // { key: "spotify", id: "spotify", label: "Spotify", icon: "spotify" },
    // { key: "facebook", id: "facebook", label: "Facebook", icon: "facebook" },
    // { key: "soundcloud", id: "soundcloud", label: "SoundCloud", icon: "soundcloud" },
    // { key: "youtube", id: "youtube", label: "YouTube", icon: "youtube" },
    // { key: "press", id: "press", label: "Press", icon: "press" },
] as const;

export type PlatformKey = (typeof PLATFORMS)[number]["key"];
export type PlatformId = (typeof PLATFORMS)[number]["id"];

const DEFAULT_PLATFORM_KEY: PlatformKey = "instagram";

const ALLOWED_PLATFORM_KEYS = PLATFORMS.map((item) => item.key) as PlatformKey[];

export const usePlatformParam = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const platformKey = useMemo<PlatformKey>(() => {
        const raw = searchParams.get("platform");
        if (!raw) return DEFAULT_PLATFORM_KEY;

        return ALLOWED_PLATFORM_KEYS.includes(raw as PlatformKey)
            ? (raw as PlatformKey)
            : DEFAULT_PLATFORM_KEY;
    }, [searchParams]);

    const platform = useMemo<PlatformId>(() => {
        return PLATFORMS.find((item) => item.key === platformKey)?.id ?? "instagram";
    }, [platformKey]);

    const setPlatform = (nextPlatformKey: PlatformKey) => {
        const next = new URLSearchParams(searchParams);
        next.set("platform", nextPlatformKey);
        setSearchParams(next, { replace: true });
    };

    return {
        platformKey,
        platform,
        setPlatform,
    };
};