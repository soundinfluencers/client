import {type FC, useRef, useState} from 'react';
import {Logo} from "./components/logo/Logo.tsx";
import {LoginButton, SignupButton} from "./components/buttons/Buttons.tsx";
import './_tab-bar.scss';
import {useNavigate} from "react-router-dom";
import {useWindowSize} from "../../../hooks/useWindowSize.ts";
import burgerMenu from '@/assets/icons/burger-menu.svg';
import {useClickOutside} from "../../../hooks/useClickOutside.ts";

interface TabBarProps {
    isAuthenticated: boolean;
}

export const TabBar: FC<TabBarProps> = ({isAuthenticated}: TabBarProps) => {
    const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);

    const tabBarRef = useRef<HTMLDivElement>(null);

    const {width} = useWindowSize();
    useClickOutside(tabBarRef, () => {
       if (isBurgerOpen) setIsBurgerOpen(false);
    });

    const navigate = useNavigate();

    const handleClickBurgerMenu = (path: string) => {
        setIsBurgerOpen(false);
        navigate(path);
    }

    return (
        <div className="tab-bar" ref={tabBarRef}>
            <Logo onClick={() => navigate('/')}/>
            <div className="tab-bar__controls">
                {width > 900 ?
                    <div className="tab-bar__controls-desktop">
                        <SignupButton onClick={() => navigate('/signup/client')}/>
                        <LoginButton onClick={() => navigate('login')}/>
                    </div> :
                    <div onClick={() => setIsBurgerOpen(!isBurgerOpen)} className="tab-bar__controls-mobile">
                        <img src={burgerMenu} alt=''/>
                    </div>
                }
            </div>
            <div className={`tab-bar__burger ${isBurgerOpen ? 'tab-bar__burger--visible' : ''}`}>
                <div className="tab-bar__button tab-bar__button--signup" onClick={() => handleClickBurgerMenu('/signup/client')}>
                    Sign up
                </div>
                <div className="tab-bar__button tab-bar__button--login" onClick={() => handleClickBurgerMenu('login')}>
                    Log in
                </div>
            </div>
        </div>
    )
};