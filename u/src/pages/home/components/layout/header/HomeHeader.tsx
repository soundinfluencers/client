import React from 'react';
import './_home-header.scss';
import arrowIcon from '@/assets/icons/arrow-down-right.svg';
import logoIcon from '@/assets/logos/small-black-logo.svg';

export interface HomeHeaderProps {
    firstName?: string;
    balance?: string;
    userRole: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({firstName, balance = "1499 €", userRole}) => {
    console.log(userRole);

    return (
        <div className="home-header">
            <div className="home-header__top">
                <div className='home-header__top-left'>
                    {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
                </div>
                <div className='home-header__top-right'></div>
            </div>

            <div className="home-header__bottom">
                <div className="home-header__create-wrapper">
                    <div className="home-header__create">
                        <p>Create a campaign</p>
                        <div className="home-header__create-img">
                            <img src={arrowIcon} alt=''/>
                        </div>
                    </div>
                </div>

                <div className="home-header__balance-block">
                    <div className="home-header__balance-title">
                        <img src={logoIcon} alt=''/>
                        <span>Balance</span>
                    </div>
                    <p className="home-header__balance-content">{balance}</p>
                </div>
            </div>
        </div>
    );
};