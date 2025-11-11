import type {ComponentType} from "react";

export type TypeCommonRoutes = {
    Auth: undefined;
    Login: undefined;
    SignupClient: undefined;
    SignupInfluncer: undefined;
    Home: undefined;
};

export type TypeClientRoutes = {
    SignupClient: undefined;
};

export type TypeInfluencerRoutes = {
    SignupInfluencer: undefined;
};

export type TypeRootStackParamList =
    & TypeCommonRoutes
    & TypeClientRoutes
    & TypeInfluencerRoutes;

export interface IRoute {
    name: keyof TypeRootStackParamList;
    path: string;
    component: ComponentType;
    isProtected: boolean;
}