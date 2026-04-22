export const getPostAuthRedirect = () => {
    const rawRedirect = sessionStorage.getItem("postAuthRedirect");
    if (!rawRedirect) return null;

    try {
        const parsed = JSON.parse(rawRedirect);
        return typeof parsed?.path === "string" ? parsed.path : null;
    } catch {
        return null;
    }
};

export const clearPostAuthRedirect = () => {
    sessionStorage.removeItem("postAuthRedirect");
};