import React from "react";
import "./_CampaignCreatorPage.scss";

import {
  useCreateCampaign,
  useCreateCampaignPlatform,
} from "@/store/client/create-campaign";

import { Breadcrumbs, Container, Loader, Proceed } from "@/components";
import { ScrollPlatforms } from "./components/scroll/scroll-platftorms/scroll-plattforms";
import { ScrollGenres } from "./components/scroll/scroll-genre/scroll-genre";
import { BuildCampaign } from "./build-campaign/build-campaign";
import { SliderForCard } from "./components/SliderForCards/slider-for-cards";
import { NoData } from "@/components/ui/no-array/no-data";
import { Footer } from "./components/footer/footer";
import { usePublishedOffersQuery } from "./hooks/use-offers-query";

export const CampaignCreatorPage: React.FC = () => {
  const { selectedPlatform, setPlatform } = useCreateCampaignPlatform();
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)",
  );

  const offers = useCreateCampaign((s) => s.offers);
  const globalLoading = useCreateCampaign((s) => s.loading);
  const offersPending = useCreateCampaign((s) => s.pending.offers);
  const setPending = useCreateCampaign((s) => s.setPending);
  const setOffersData = useCreateCampaign((s) => s.setOffersData);

  const { data, isLoading, isFetching, isError, refetch } =
    usePublishedOffersQuery(selectedPlatform, selectedGenre);

  React.useEffect(() => {
    setPending("offers", isLoading || isFetching);
  }, [isLoading, isFetching, setPending]);

  React.useEffect(() => {
    if (data) setOffersData(data);
  }, [data, setOffersData]);

  return (
    <Container className="Campaign_Creator_Page">
      <Proceed />

      {globalLoading && <Loader />}

      <div className="Campaign_Creator_Page__head">
        <div className="navmenu">
          <Breadcrumbs />
        </div>
        <h1>Ready-to-launch offers</h1>

        <ScrollPlatforms
          selectedPlatform={selectedPlatform}
          onPlatformSelect={setPlatform}
        />

        <ScrollGenres
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />
      </div>

      {isError ? (
        <div style={{ padding: 16 }}>
          <p>Failed to load offers</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      ) : (
        <>
          {!offersPending &&
            (offers.length > 0 ? (
              <SliderForCard offers={offers} />
            ) : (
              <NoData title={"offers for this genre yet"} />
            ))}
        </>
      )}

      <BuildCampaign />
      <Footer />
    </Container>
  );
};
