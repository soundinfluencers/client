import type {IRoute} from "./navigation.types.ts";
import {LoginPage} from "../pages/auth/login/LoginPage.tsx";
import {AuthPage} from "../pages/auth/auth/AuthPage.tsx";
import {SignupPage} from "../pages/auth/signup/SignupPage.tsx";

export const routes: IRoute[] = [
    {
        name: "Auth",
        path: "/auth",
        component: AuthPage,
        isProtected: false,
    },
    {
        name: "Login",
        path: "/login",
        component: LoginPage,
        isProtected: false,
    },
    {
        name: "SignupClient",
        path: "/signup/client",
        component: SignupPage,
        isProtected: false,
    },
    {
        name: "SignupInfluncer",
        path: "/signup/client",
        component: SignupPage,
        isProtected: false,
    },
]