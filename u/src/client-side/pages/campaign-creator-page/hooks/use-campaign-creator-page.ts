import React from "react";
import { usePublishedOffersQuery } from "@/client-side/react-query";
import {
    useCreateCampaign,
    useCreateCampaignPlatform,
} from "@/client-side/store";
import {
    DEFAULT_CAMPAIGN_CREATOR_GENRE
} from "@/client-side/pages/campaign-creator-page/model/campaign-creator.constants.ts";

export const useCampaignCreatorPage = () => {
    const { selectedPlatform, setPlatform } = useCreateCampaignPlatform();
    const [selectedGenre, setSelectedGenre] = React.useState(
        DEFAULT_CAMPAIGN_CREATOR_GENRE,
    );

    const offers = useCreateCampaign((s) => s.offers);
    const setPending = useCreateCampaign((s) => s.setPending);
    const setOffersData = useCreateCampaign((s) => s.setOffersData);

    const query = usePublishedOffersQuery(selectedPlatform, selectedGenre);

    React.useEffect(() => {
        setPending("offers", query.isLoading || query.isFetching);
    }, [query.isLoading, query.isFetching, setPending]);

    React.useEffect(() => {
        if (query.data) {
            setOffersData(query.data);
        }
    }, [query.data, setOffersData]);

    return {
        selectedPlatform,
        setPlatform,
        selectedGenre,
        setSelectedGenre,
        offers,
        ...query,
    };
};