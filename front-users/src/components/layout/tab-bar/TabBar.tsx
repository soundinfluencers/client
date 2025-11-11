import {type FC} from 'react';
import {Logo} from "./components/logo/Logo.tsx";
import {LoginButton, SignupButton} from "./components/buttons/Buttons.tsx";
import './_tab-bar.scss';

interface TabBarProps {
    isAuthenticated: boolean;
}

export const TabBar: FC<TabBarProps> = ({ isAuthenticated } : TabBarProps) => {
    console.log(isAuthenticated, 'isAuth')

    return (
        <div className="tab-bar">
            <Logo/>
            <div className="tab-bar__controls">
                <SignupButton/>
                <LoginButton/>
            </div>
        </div>
    )
};