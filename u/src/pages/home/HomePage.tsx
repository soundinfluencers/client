import {type FC, useEffect} from "react";
import './_home-page.scss';
import {HomeHeader} from "./components/layout/header/HomeHeader.tsx";
import {ButtonMain} from "../../components/ui/buttons/button/Button.tsx";
import {logoutApi} from "../../api/auth/auth.api.ts";
import {useAuth} from "../../contexts/AuthContext.tsx";
// import {getCampaigns} from "../../api/client/campaign/client-campaign.api.ts";

export const HomePage: FC = () => {
    const { logout } = useAuth();

    // useEffect(() => {
    //     const getData = async () => getCampaigns("66a747a89c6e78a6cffb83b4");
    //
    //     getData();
    // }, []);

    return (
        <div className='home-page'>
            <HomeHeader/>
            <ButtonMain text={'logout'} onClick={logout}/>
        </div>
    )
}