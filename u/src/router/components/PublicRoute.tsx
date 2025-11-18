import {Navigate} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
}

export const PublicRoute = ({children}: Props) => {
    const {accessToken} = useAuth();

    if (accessToken) {
        return <Navigate to="/client/home" replace />;
    }

    return <>{children}</>;
};
