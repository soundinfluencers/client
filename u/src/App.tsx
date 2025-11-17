import {Routes, Route, useNavigate, Navigate} from "react-router-dom";
import {TabBar} from "./components/layout/tab-bar/TabBar.tsx";
import {routes} from "./router/routes.ts";
import {useEffect} from "react";
import {useAuth} from "./contexts/AuthContext.tsx";
import {setupInterceptors} from "./api/api.ts";

function App() {
    const navigate = useNavigate();

    const {accessToken, setAccessToken, logout} = useAuth();

    useEffect(() => {
        setupInterceptors(
            () => accessToken,
            setAccessToken,
            logout
        );
    }, []);

    useEffect(() => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            navigate(accessToken ? "/home" : "/auth", {replace: true});
        }
    }, [navigate, accessToken]);

    return (
        <div>
            <TabBar isAuthenticated={!!accessToken}/>

            <Routes>
                {routes.map(({path, component: Component, name}) => (
                    <Route key={name} path={path} element={<Component/>}/>
                ))}
                <Route path="*" element={<Navigate to="/auth" replace/>}/>
            </Routes>
        </div>
    );
}

export default App;