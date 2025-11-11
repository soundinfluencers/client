import {type FC} from 'react';
import {Logo} from "./components/logo/Logo.tsx";
import {LoginButton, SignupButton} from "./components/buttons/Buttons.tsx";
import './_tab-bar.scss';
import {useNavigate} from "react-router-dom";

interface TabBarProps {
    isAuthenticated: boolean;
}

export const TabBar: FC<TabBarProps> = ({ isAuthenticated } : TabBarProps) => {
    const navigate = useNavigate();

    return (
        <div className="tab-bar">
            <Logo onClick={() => navigate('/')}/>
            <div className="tab-bar__controls">
                <SignupButton onClick={() => navigate('/signup/client')}/>
                <LoginButton onClick={() => navigate('login')}/>
            </div>
        </div>
    )
};