import {Navigate} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import type {ReactNode} from "react";
import {useUser} from "@/store/get-user";
import {Loader} from "@/components";

interface Props {
    children: ReactNode;
}

export const PublicRoute = ({children}: Props) => {
    const {accessToken, isAuthReady} = useAuth();
    const {user} = useUser();

    if (!isAuthReady) {
        return <div><Loader/></div>;
    }

    if (accessToken) {
        let route: string;

        switch (user?.role) {
            case 'influencer':
                route = '/influencer';
                break;
            case 'client':
                route = '/client';
                break;
            default:
                route = '/';
                break;
        }

        return <Navigate to={route} replace/>;
    }

    return <>{children}</>;
};
