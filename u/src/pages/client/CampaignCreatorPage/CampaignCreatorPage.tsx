import React from "react";
import "./_CampaignCreatorPage.scss";
import {
  useCreateCampaign,
  useCreateCampaignPlatform,
} from "@/store/client/createCampaign";
import { Breadcrumbs, Container, Loader, Proceed } from "@/components";
import { ScrollPlatforms } from "./components/scroll/scrollPlatftorms/scrollPlattforms";
import { ScrollGenres } from "./components/scroll/scrollGenre/scrollGenre";
import { BuildCampaign } from "./buildCampaign/build-campaign";
import { SliderForCard } from "./components/SliderForCards/SliderForCards";
import { useIsFetching } from "@tanstack/react-query";
import { NoData } from "@/components/ui/no-array/no-data";
import { Footer } from "./components/footer/footer";

export const CampaignCreatorPage: React.FC = () => {
  const lastKeyRef = React.useRef<string>("");

  const setOffers = useCreateCampaign((s) => s.setOffers);
  const offers = useCreateCampaign((s) => s.offers);
  const offersLoading = useCreateCampaign((s) => s.loading);
  const isFetching = useIsFetching();

  const globalLoading = offersLoading || isFetching > 0;

  const { selectedPlatform, setPlatform } = useCreateCampaignPlatform();
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)",
  );

  React.useEffect(() => {
    const key = `${selectedPlatform}__${selectedGenre}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    setOffers(selectedPlatform, selectedGenre);
  }, [selectedPlatform, selectedGenre, setOffers]);

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

      {offers.length > 0 ? (
        <SliderForCard offers={offers} />
      ) : (
        <NoData title={"offers for this genre yet"} />
      )}
      <BuildCampaign />
      <Footer />
    </Container>
  );
};
