import { $auth } from "@/api/api";

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(
    setAccessToken: (t: string | null) => void,
) {
    if (!refreshPromise) {
        refreshPromise = $auth
            .post("/auth/refresh")
            .then((res) => {
                const token = res.data.data.accessToken;
                setAccessToken(token);
                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}