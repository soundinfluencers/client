import {type FC, useEffect} from "react";
import './_home-page.scss';
import {HomeHeader} from "./components/layout/header/HomeHeader.tsx";
import {getCampaigns} from "../../api/client/campaign/client-campaign.api.ts";
import {useQuery} from "@tanstack/react-query";
import {CampaignsList} from "./components/layout/campaigns-list/CampaignsList.tsx";
import type {CampaignForList} from "../../types/campaign.types.ts";

export const HomePage: FC = () => {
    const { data: campaigns, isLoading, error } = useQuery<CampaignForList[]>({
        queryKey: ['campaigns'],
        queryFn: getCampaigns,
        staleTime: 1000 * 60 * 5,
    });

    console.log(campaigns, 'campaigns')
    return (
        <div className='home-page'>
            <HomeHeader/>
            {campaigns ? (
                <CampaignsList listDisplayMode={'list'} list={campaigns}/>
            ) : (<p>error</p>)}
        </div>
    )
}