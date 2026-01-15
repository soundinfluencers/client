import React from "react";
import "./_CampaignCreatorPage.scss";
import { useCreateCampaign, useFilter } from "@/store/client/createCampaign";
import { Breadcrumbs, Container, Loader, SaveDraft } from "@/components";
import { ScrollPlatforms } from "./components/scroll/scrollPlatftorms/scrollPlattforms";
import { ScrollGenres } from "./components/scroll/scrollGenre/scrollGenre";
import { BuildCampaign } from "./buildCampaign/build-campaign";
import { SliderForCard } from "./components/SliderForCards/SliderForCards";
import { useCreateCampaignPlatform } from "@/store/client/createCampaign/useCreate-campaign-fetch";

interface Props {}

export const CampaignCreatorPage: React.FC<Props> = () => {
  const { setOffers, offers, loading } = useCreateCampaign();
  const { selectedPlatform, setPlatform } = useCreateCampaignPlatform();
  const { setSelected } = useFilter();
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)"
  );
  React.useEffect(() => {
    setOffers(selectedPlatform, selectedGenre);
  }, []);

  const handlePlatformSelect = (platform: string) => {
    setPlatform(platform);
    // setSelected()
    if (selectedGenre) {
      setOffers(platform, selectedGenre);
    }
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);

    if (selectedPlatform) {
      setOffers(selectedPlatform, genre);
    }
  };

  return (
    <Container className="Campaign_Creator_Page">
      {loading && <Loader />}
      <div className="Campaign_Creator_Page__head">
        {" "}
        <div className="navmenu">
          <Breadcrumbs />
          <SaveDraft />
        </div>{" "}
        <h1>Ready-to-launch offers</h1>
        <ScrollPlatforms
          selectedPlatform={selectedPlatform}
          onPlatformSelect={handlePlatformSelect}
        />
        <ScrollGenres
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
        />
      </div>{" "}
      <SliderForCard packages={offers} />
      <BuildCampaign />
    </Container>
  );
};
