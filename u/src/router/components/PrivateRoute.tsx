import {Navigate} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import type {ReactNode} from "react";
import {Loader} from "@/components";

interface Props {
    children: ReactNode;
}

export const PrivateRoute = ({children}: Props) => {
    const {accessToken, isAuthReady} = useAuth();

    if (!isAuthReady) {
        return <div><Loader/></div>;
    }

    if (!isAuthReady) {
        return (
            <div>
                <Loader/>
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/auth" replace/>;
    }

    return <>{children}</>;
};
