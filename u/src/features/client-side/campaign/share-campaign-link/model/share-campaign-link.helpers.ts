export const buildShareUrl = ({
                                  campaignId,
                                  socialMedia,
                                  kind,
                              }: {
    campaignId: string;
    socialMedia?: string;
    kind?: "regular" | "proposal" | null;
}) => {
    const origin = "https://go.soundinfluencers.com";

    const id = encodeURIComponent(campaignId);
    const media = encodeURIComponent(
        kind === "proposal" ? "proposal" : String(socialMedia ?? ""),
    );

    return `${origin}/promo-share/${id}/${media}`;
};