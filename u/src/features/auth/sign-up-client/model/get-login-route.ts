

export const SIGN_UP_ROUTES: Record<any, string> = {
    client: "/sign-up/client",
    influencer: "/sign-up/influencer",
} as const;

export const getLoginRoute = (role: any) => ({
    pathname: "/login",
    search: `?role=${role}`,
});

export const getForgotPasswordRoute = (role: any) => ({
    pathname: "/forgot-password",
    search: `?role=${role}`,
});
