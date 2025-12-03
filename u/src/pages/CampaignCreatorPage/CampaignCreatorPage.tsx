import React from "react";
import "./_CampaignCreatorPage.scss";
import { ScrollPlatforms } from "./scrollPlatftorms/scrollPlattforms";
import { ScrollGenres } from "./scrollGenre/scrollGenre";
import { SliderForCard } from "./SliderForCards/SliderForCards";
import { getPublishedOffers } from "../../api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";
import { BuildCampaign } from "./buildCampaign/build-campaign";
interface Props {}

export const CampaignCreatorPage: React.FC<Props> = () => {
  const [selectedPlatform, setSelectedPlatform] = React.useState("instagram");
  const [selectedGenre, setSelectedGenre] = React.useState(
    "Techno (Melodic, Minimal)"
  );
  const [offers, setOffers] = React.useState<any[]>([]);
  React.useEffect(() => {
    const fetchOffers = async () => {
      const data = await getPublishedOffers(selectedPlatform, selectedGenre);
      setOffers(data);
    };
    fetchOffers();
  }, []);
  const handlePlatformSelect = async (platform: string) => {
    setSelectedPlatform(platform);
    if (selectedGenre) {
      try {
        const data = await getPublishedOffers(platform, selectedGenre);
        setOffers(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    if (selectedPlatform) {
      try {
        const data = await getPublishedOffers(selectedPlatform, genre);
        setOffers(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="Campaign_Creator_Page">
      <div className="Campaign_Creator_Page__head">
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
    </div>
  );
};
