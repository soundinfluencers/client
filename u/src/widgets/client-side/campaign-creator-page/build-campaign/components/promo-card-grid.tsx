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

interface Props {
    data: PromoAccount;
    isInclude: boolean;
    isSelected: boolean;
}

const getPriceByCurrency = (
    prices: Record<string, number>,
    currency: { currency: string },
) => {
    return Number(prices?.[currency.currency] ?? prices?.EUR ?? 0);
};

export const PromoCardGrid: React.FC<Props> = ({
                                                   data,
                                                   isInclude,
                                                   isSelected,
                                               }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const { selectedCurrency } = useBuildCampaignParams();
    const togglePromoCard = useCampaignBuilderStore((s) => s.actions.togglePromoCard);

    const [open, setOpen] = React.useState(false);

    const hasGenres = (data.musicGenres?.length ?? 0) > 0;
    const hasCountries = (data.countries?.length ?? 0) > 0;
    const hasMeta = hasGenres || hasCountries;
    const onSelect = () => {
        if (isInclude) return;

        console.log("[TABLE CARD] selected data", data);
        console.log("[TABLE CARD] account id fields", {
            accountId: data.accountId,
            socialAccountId: (data as any).socialAccountId,
            _id: (data as any)._id,
        });
        console.log("[TABLE CARD] audience fields", {
            followers: data.followers,
            monthlyListeners: (data as any).monthlyListeners,
            listeners: (data as any).listeners,
            subscribers: (data as any).subscribers,
            audience: (data as any).audience,
        });

        togglePromoCard({
            accountId: data.accountId,
            influencerId: data.influencerId,
            socialMedia: data.socialMedia,
            username: data.username,
            profileType: data.profileType,
            price: getPriceByCurrency(data.prices, selectedCurrency),
            dateRequest: "ASAP",
            followers: data.followers,
            countries: data.countries,
            genres: data.musicGenres,
            logoUrl: data.logoUrl,
            source: "manual",
        });

        console.log("[BUILDER STORE] after toggle", useCampaignBuilderStore.getState());
    };

    return (
        <div
            ref={dropdownRef}
            onClick={onSelect}
            className={`${styles.card} ${open ? styles.open : ""} ${
                isInclude ? styles.include : ""
            } ${isSelected ? styles.active : ""}`}
        >
            <div className={styles.head}>
                <div className={styles.cost}>
                    <img src={data.logoUrl} alt="" />
                    <p>
                        {getPriceByCurrency(data.prices, selectedCurrency)}
                        {selectedCurrency.key}
                    </p>
                </div>

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
                    {hasMeta && (
                        <div
                            onClick={() => setOpen((prev) => !prev)}
                            className={`${styles.infoHead} ${open ? styles.infoHeadActive : ""}`}
                        >
                            <img src={chevronDown} alt="" />
                        </div>
                    )}
                </div>

                {open && hasMeta && (
                    <GenresCountriesPopover
                        refElement={dropdownRef}
                        setOpen={setOpen}
                        open={open}
                        data={{
                            musicGenres: data.musicGenres ?? [],
                            countries: data.countries ?? [],
                        }}
                        isInclude={isInclude}
                        isSelected={isSelected}
                    />
                )}
            </div>

            {isInclude && (
                <div className={styles.includedText}>
                    <p>Included in your selected offer</p>
                </div>
            )}
        </div>
    );
};