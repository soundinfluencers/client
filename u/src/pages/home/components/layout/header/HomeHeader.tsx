import type {FC} from "react";
import './_home-header.scss';
import type {UserRoleType} from "../../../../../types/user/user.types.ts";

export interface HomeHeaderProps {
    firstName?: string;
    balance?: string;
    userRole: UserRoleType;
}

export const HomeHeader: FC<HomeHeaderProps> = ({firstName, userRole}: HomeHeaderProps) => {
    return (
        <div className='home-header'>
            <div className='home-header__top'>
                {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
            </div>
            <div className='home-header__bottom'>
                <div className='home-header__bottom-button'>
                    <p>Create a campaign</p>

                </div>
                <div className='home-header__bottom-rectangle'>
                    1499 €
                </div>
            </div>
        </div>
    )
}