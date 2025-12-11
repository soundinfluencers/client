import React from "react";
import "./_CampaignCreatorPage.scss";
import { ScrollPlatforms } from "./scrollPlatftorms/scrollPlattforms";
import { ScrollGenres } from "./scrollGenre/scrollGenre";
import { SliderForCard } from "./SliderForCards/SliderForCards";
import { getPublishedOffers } from "../../../api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";
import { BuildCampaign } from "./buildCampaign/build-campaign";
import { Container } from "../../../components/container/container";
import { useCreateCampaign } from "../../../store/createCampaign";
import { Loader } from "../../../components/ui/loader/loader";
import { Breadcrumbs } from "../../../components/ui/Breadcrumbs/pathnames";
import { SaveDraft } from "../../../components/save-draft/save-draft";
interface Props {}

export const CampaignCreatorPage: React.FC<Props> = () => {
  const { setOffers, offers, loading } = useCreateCampaign();
  const [selectedPlatform, setSelectedPlatform] = React.useState("instagram");
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)"
  );

  React.useEffect(() => {
    const fetchOffers = async () => {
      await setOffers(selectedPlatform, selectedGenre);
    };
    fetchOffers();
  }, []);
  const handlePlatformSelect = async (platform: string) => {
    setSelectedPlatform(platform);
    if (selectedGenre) {
      try {
        await setOffers(platform, selectedGenre);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    if (selectedPlatform) {
      try {
        await setOffers(selectedPlatform, genre);
      } catch (err) {
        console.error(err);
      }
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
