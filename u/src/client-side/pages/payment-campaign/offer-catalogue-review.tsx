import { useState } from "react";
import { usePublishedOffersQuery } from "@/entities/client-side/campaign-creator-page/offer/api/offer.queries";
import { PLATFORMS, type PlatformKey } from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param";
import { getGenresByPlatform } from "@/features/client-side/campaign-creator-page/select-genre/model/use-genre-param";

type CatalogueContext = { platform: string; genre: string };

// Mounted only on request. The payment form stays mounted while the catalogue is refreshed.
export const OfferCatalogueReview = ({ initialContext, onReviewSelection }: {
    initialContext: CatalogueContext | null;
    onReviewSelection: (context: CatalogueContext) => void;
}) => {
    const [platform, setPlatform] = useState(initialContext?.platform ?? "");
    const [genre, setGenre] = useState(initialContext?.genre ?? "");
    const query = usePublishedOffersQuery(platform, genre);
    return <div>
        <p>Choose the catalogue to refresh, then review your campaign selection.</p>
        <label>Platform <select value={platform} onChange={(event) => { setPlatform(event.target.value); setGenre(""); }}>
            <option value="">Choose a platform</option>
            {PLATFORMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
        <label>Genre <select value={genre} disabled={!platform} onChange={(event) => setGenre(event.target.value)}>
            <option value="">Choose a genre</option>
            {genre && !getGenresByPlatform(platform as PlatformKey).some((item) => item.id === genre) && <option value={genre}>{genre}</option>}
            {platform && getGenresByPlatform(platform as PlatformKey).map((item) =>
                <option key={item.id} value={item.id}>{item.text} {item.subText}</option>)}
        </select></label>
        {platform && genre && <>
            {query.isFetching && <p>Loading current catalogue…</p>}
            {query.isError && <p role="alert">Could not refresh the catalogue. Please try again.</p>}
            <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>Refresh catalogue</button>
            {query.isSuccess && !query.isFetching && <>
                {!query.data.length && <p>No offers are available in this catalogue.</p>}
                <ul>{query.data.map((offer) => <li key={offer.id}>{offer.title}: {offer.price} EUR</li>)}</ul>
                <button type="button" onClick={() => onReviewSelection({ platform, genre })}>Review campaign selection</button>
            </>}
        </>}
    </div>;
};
