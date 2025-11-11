import {Routes, Route, useNavigate} from "react-router-dom";
import {TabBar} from "./components/layout/tab-bar/TabBar.tsx";
import {routes} from "./router/routes.ts";
import {useEffect} from "react";

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
            navigate("/auth", { replace: true });
        }
    }, [navigate]);

    return (
        <div>
            <TabBar isAuthenticated={false}/>

            <Routes>

                {routes.map(({ path, component: Component, name }) => (
                    <Route key={name} path={path} element={<Component />} />
                ))}
            </Routes>
        </div>
    );
}

export default App;