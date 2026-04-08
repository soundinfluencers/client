import type {ConnectedAccount} from "@/client-side/types/offers.ts";


export const groupPromoCardsBySocialMedia = (promoCards: ConnectedAccount[]) => {
    const map = new Map<string, ConnectedAccount[]>();

    for (const card of promoCards) {
        const key = (card.socialMedia ?? "other").toLowerCase();
        map.set(key, [...(map.get(key) ?? []), card]);
    }

    const titleMap: Record<string, string> = {
        tiktok: "TikTok",
        instagram: "Instagram",
        youtube: "YouTube",
        facebook: "Facebook",
        soundcloud: "SoundCloud",
        spotify: "Spotify",
        press: "Press",
    };

    return Array.from(map.entries()).map(([key, items]) => ({
        key,
        title: titleMap[key] ?? key,
        socialMedia: items[0]?.socialMedia,
        items,
    }));
};