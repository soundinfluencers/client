import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { Checkbox } from "@/components";
import { TagsDropdown } from "./tags-dropdown";
import styles from "./table-row-card.module.scss";
import type {
    PromoAccount
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";
import {
    useBuildCampaignParams
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params.ts";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import type {SocialMediaType} from "@/shared/types/utils/constants.types.ts";

interface Props {
    data: PromoAccount;
    setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
    isSmall: boolean;
    isInclude: boolean;
    isSelected: boolean;
}

const getPriceByCurrency = (
    prices: Record<string, number>,
    currency: { currency: string },
) => {
    return Number(prices?.[currency.currency] ?? prices?.EUR ?? 0);
};

export const TableRowCard: React.FC<Props> = ({
                                                  data,
                                                  setIsSmall,
                                                  isSmall,
                                                  isInclude,
                                                  isSelected,
                                              }) => {
    const { selectedCurrency } = useBuildCampaignParams();
    const togglePromoCard = useCampaignBuilderStore((s) => s.actions.togglePromoCard);



    const onToggle = () => {
        if (isInclude) return;

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
    };
    React.useEffect(() => {
        const el = document.querySelector(`[data-id="${data.accountId}"]`);
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0].contentRect.width;
            setIsSmall(width <= 896);
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [data.accountId, setIsSmall]);

    const genres = [...(data.musicGenres || [])];
    const countries =
        data.countries?.map((c) => `${c.country} ${c.percentage}%`) ?? [];

    return (
        <div
            data-id={data.accountId}
            className={`${styles.row} ${isSmall ? styles.adaptive : ""}`}
        >
            <div className={styles.name}>
                <Checkbox
                    onChange={onToggle}
                    isChecked={isInclude || isSelected}
                    name={data.username}
                />
            </div>

            <div className={styles.price}>
                <img src={data.logoUrl} alt="" />
                <span>
          {getPriceByCurrency(data.prices, selectedCurrency)}
                    {selectedCurrency.key}
        </span>
            </div>

            <div className={styles.followers}>
                <img src={getSocialMediaIcon(data.socialMedia as SocialMediaType) || ""} alt="" />
                {data.socialMedia !== "press" ? (
                    <span>{formatFollowers(data.followers)}</span>
                ) : (
                    <span>-</span>
                )}
            </div>

            <div className={styles.genres}>
                <TagsDropdown items={genres} placeholder="No genres" />
            </div>

            <div className={styles.countries}>
                <TagsDropdown items={countries} placeholder="No countries" />
            </div>
        </div>
    );
};