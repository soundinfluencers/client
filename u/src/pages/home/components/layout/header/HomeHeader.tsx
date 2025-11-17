import React from 'react';
import './_home-header.scss';
import arrowIcon from '@/assets/icons/arrow-down-right.svg';
import logoIcon from '@/assets/logos/small-black-logo.svg';
import {useWindowSize} from "../../../../../hooks/useWindowSize.ts";

export interface HomeHeaderProps {
    firstName?: string;
    balance?: string;
    userRole: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({firstName, balance = "0 €", userRole}) => {
    console.log(userRole);
    const { width } = useWindowSize();

    return (
        width > 500 ? (
            <div className="home-header">
                <div className="home-header__left">
                    <div className="home-header__greeting">
                        {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
                    </div>

                    <div className="home-header__create-wrapper">
                        <div className="home-header__create">
                            <p>Create a campaign</p>

                            <div className="home-header__create-img">
                                <img src={arrowIcon} alt=''/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="home-header__right">
                    <div className="home-header__right-top"></div>

                    <div className="home-header__right-bottom">
                        <div className="home-header__balance-block">
                            <div className="home-header__balance-title">
                                <img src={logoIcon} alt=''/>
                                <p>Balance</p>
                            </div>

                            <div className="home-header__balance-content">
                                <p>{balance}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="home-header-mobile">
                <div className="home-header-mobile__rectangle">
                    <div className="home-header-mobile__greeting">
                        {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
                    </div>

                    <div className="home-header__balance-block">
                        <div className="home-header__balance-title">
                            <img src={logoIcon} alt=''/>
                            <p>Balance</p>
                        </div>

                        <div className="home-header__balance-content">
                            <p>{balance}</p>
                        </div>
                    </div>
                </div>

                <div className="home-header__create-wrapper">
                    <div className="home-header__create">
                        <p>Create a campaign</p>

                        <div className="home-header__create-img">
                            <img src={arrowIcon} alt=''/>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};