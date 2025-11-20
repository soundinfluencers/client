import {type FC, useEffect} from "react";
import './_home-page.scss';
import {HomeHeader} from "./components/layout/header/HomeHeader.tsx";
import {getCampaigns} from "../../api/client/campaign/client-campaign.api.ts";

export const HomePage: FC = () => {
    useEffect(() => {
        const getData = async () => getCampaigns();

        getData();
    }, []);

    return (
        <div className='home-page'>
            <HomeHeader/>
        </div>
    )
}