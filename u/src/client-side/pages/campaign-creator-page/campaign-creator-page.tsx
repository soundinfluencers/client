import React from "react";
import "./campaign-creator-page.scss";

import { Breadcrumbs, Container, Loader } from "@/components";

import { NoData } from "@/components/ui/no-array/no-data";
import { usePublishedOffersQuery } from "@/client-side/react-query";
import {
  BuildCampaign,
  Footer,
  ScrollGenres,
  ScrollPlatforms,
  SliderForCard,
} from "@/client-side/widgets";
import {
  useCreateCampaign,
  useCreateCampaignPlatform,
} from "@/client-side/store";
import { Proceed } from "@/client-side/components/proceed/proceed";

export const CampaignCreatorPage: React.FC = () => {
  const { selectedPlatform, setPlatform } = useCreateCampaignPlatform();
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)",
  );

  const offers = useCreateCampaign((s) => s.offers);
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
    <Container className="campaign-creator-page">
      <Proceed />

      <div className="campaign-creator-page__head">
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
          {offers.length > 0 ? (
            <SliderForCard isLoading={isFetching} offers={offers} />
          ) : (
            <NoData title={"offers for this genre yet"} />
          )}
        </>
      )}

      <BuildCampaign />
      <Footer />
    </Container>
  );
};
