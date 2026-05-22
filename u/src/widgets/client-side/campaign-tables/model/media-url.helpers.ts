type MediaSource = {
    url?: string | null;
    pathLower?: string;
};

export const normalizeDropboxVideoUrl = (url: string) => {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("dropbox.com")) {
            parsed.searchParams.delete("dl");
            parsed.searchParams.set("raw", "1");
        }

        return parsed.toString();
    } catch {
        return url;
    }
};

export const normalizeGoogleDriveVideoUrl = (url: string) => {
    try {
        const parsed = new URL(url);

        if (!parsed.hostname.includes("drive.google.com")) {
            return url;
        }

        const fileId =
            parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
            parsed.searchParams.get("id");

        if (!fileId) return url;

        return `https://drive.google.com/file/d/${fileId}/preview`;
    } catch {
        return url;
    }
};

export const normalizeExternalVideoUrl = (url: string) => {
    if (url.includes("dropbox.com")) {
        return normalizeDropboxVideoUrl(url);
    }

    if (url.includes("drive.google.com")) {
        return normalizeGoogleDriveVideoUrl(url);
    }

    return url;
};

export const resolveVideoUrl = ({ url, pathLower }: MediaSource) => {
    if (url) {
        return normalizeExternalVideoUrl(url);
    }

    if (pathLower) {
        return null;
    }

    return null;
};