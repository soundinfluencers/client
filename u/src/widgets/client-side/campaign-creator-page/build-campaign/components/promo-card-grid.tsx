import React from "react";
import chevronDown from "@/assets/icons/Vector (17).svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { GenresCountriesPopover } from "./genres-countries-popover";
import styles from "./promo-card-grid.module.scss";
import {
    useBuildCampaignParams
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import type {
    PromoAccount
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";
import type {socialMediaType} from "@/pages/influencer/promos/types/promos.types.ts";
import {
    mapNetworkBundlePreviewsToDisplayModels,
} from "../model/network-bundle-preview.mappers";
import { EmbeddedBundlePreviewList } from "./embedded-bundle-preview";

interface Props {
    data: PromoAccount;
    isInclude: boolean;
    isDisabled: boolean;
    isSelected: boolean;
    selectedBundleIds: ReadonlySet<string>;
    pendingBundleIds: ReadonlySet<string>;
    disabledBundleIds: ReadonlySet<string>;
    onChooseBundle: (bundleId: string) => void;
}

const getPriceByCurrency = (
    prices: Record<string, number>,
    currency: { currency: string },
) => {
    return prices?.[currency.currency];
};

export const PromoCardGrid: React.FC<Props> = ({
                                                   data,
                                                   isInclude,
                                                   isDisabled,
                                                   isSelected,
                                                   selectedBundleIds,
                                                   pendingBundleIds,
                                                   disabledBundleIds,
                                                   onChooseBundle,
                                               }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const { selectedCurrency, selectedCurrencyCode } = useBuildCampaignParams();
    const togglePromoCard = useCampaignBuilderStore((s) => s.actions.togglePromoCard);

    const [open, setOpen] = React.useState(false);

    const hasGenres = (data.musicGenres?.length ?? 0) > 0;
    const hasCountries = (data.countries?.length ?? 0) > 0;
    const hasMeta = hasGenres || hasCountries;
    const isPartOfBundle = data.bundlePreviews.length > 0;
    const bundlePreviews = React.useMemo(
        () =>
            mapNetworkBundlePreviewsToDisplayModels(
                data.bundlePreviews ?? [],
                selectedCurrency.currency,
            ),
        [
            data.bundlePreviews,
            selectedCurrency.currency,
        ],
    );
    const hasBundlePreviews = bundlePreviews.length > 0;
    const hasDetails = hasMeta || hasBundlePreviews;
    const onSelect = () => {
        if (isDisabled) return;

        togglePromoCard({
            accountId: data.accountId,
            influencerId: data.influencerId,
            socialMedia: data.socialMedia,
            username: data.username,
            profileType: data.profileType,
            price: getPriceByCurrency(data.prices, selectedCurrency),
            prices: { ...data.prices },
            dateRequest: "ASAP",
            followers: data.followers,
            countries: data.countries,
            genres: data.musicGenres,
            logoUrl: data.logoUrl,
            source: "manual",
        }, selectedCurrencyCode);
    };

    return (
        <div
            ref={dropdownRef}
            onClick={onSelect}
            className={`${styles.card} ${open ? styles.open : ""} ${
                open && hasBundlePreviews
                    ? styles.openWithBundlePreviews
                    : ""
            } ${
                isDisabled ? styles.include : ""
            } ${isSelected ? styles.active : ""}`}
        >
            <div className={styles.head}>
                <div className={styles.cost}>
                    <img src={data.logoUrl} alt="" />
                    <p>
                        {getPriceByCurrency(data.prices, selectedCurrency) ?? "—"}
                        {selectedCurrency.key}
                    </p>
                </div>

                {isPartOfBundle && (
                    <span className={styles.bundleBadge}>
                        Part of Bundle
                    </span>
                )}

                <div className={styles.social}>
                    <img src={getSocialMediaIcon(data.socialMedia as socialMediaType) || ""} alt="" />
                    {data.socialMedia !== "press" && (
                        <p>{formatFollowers(data.followers)}</p>
                    )}
                </div>
            </div>

            <div className={styles.information}>
                <div className={styles.overflow}>
                    <p>{data.username}</p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    {hasDetails && (
                        <div
                            onClick={() => setOpen((prev) => !prev)}
                            className={`${styles.infoHead} ${open ? styles.infoHeadActive : ""}`}
                        >
                            <img src={chevronDown} alt="" />
                        </div>
                    )}
                </div>
            </div>

            {open && hasDetails && (
                <GenresCountriesPopover
                    refElement={dropdownRef}
                    setOpen={setOpen}
                    open={open}
                    data={{
                        musicGenres: data.musicGenres ?? [],
                        countries: data.countries ?? [],
                    }}
                    isInclude={isDisabled}
                    isSelected={isSelected}
                    inFlow={hasBundlePreviews}
                >
                    <EmbeddedBundlePreviewList
                        previews={bundlePreviews}
                        selectedBundleIds={selectedBundleIds}
                        pendingBundleIds={pendingBundleIds}
                        disabledBundleIds={disabledBundleIds}
                        onChooseBundle={onChooseBundle}
                    />
                </GenresCountriesPopover>
            )}

            {isInclude && (
                <div className={styles.includedText}>
                    <p>Included in your selected offer</p>
                </div>
            )}
        </div>
    );
};
