import React from "react";
import "./_card-bc_card.scss";
import { getSocialMediaIcon } from "@/constants/social-medias";
import chevronDown from "@/assets/icons/Vector (17).svg";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { getPriceByCurrency } from "@/client-side/utils";
import {
    useBuildCampaignFilters,
    useSelectCampaignProposal,
    useProposalAccountsStore,
} from "@/client-side/store";
import { GenresCountries } from "@/shared/ui";
import type { ConnectedAccount } from "@/client-side/types/offers.ts";
import { useSearchParams } from "react-router-dom";

interface Props {
    data: ConnectedAccount;
    isInclude: boolean;
}

const EMPTY_ACCOUNTS: any[] = [];

export const Card: React.FC<Props> = ({ data, isInclude }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const { actions, promoCard } = useSelectCampaignProposal();
    const { selectedCurrency } = useBuildCampaignFilters();

    const [searchParams] = useSearchParams();
    const optionIndex = Number(searchParams.get("option") ?? 0);

    const existingAccounts = useProposalAccountsStore(
        (s) => s.accountsByOption[optionIndex] ?? EMPTY_ACCOUNTS,
    );

    const [flag, setFlag] = React.useState(false);

    const hasGenres = (data.musicGenres?.length ?? 0) > 0;
    const hasCountries = (data.countries?.length ?? 0) > 0;
    const hasMeta = hasGenres || hasCountries;

    const isSelectedNow = promoCard.some(
        (card) => String(card.accountId) === String(data.accountId),
    );

    const isAlreadyInProposal = existingAccounts.some(
        (account) => String(account.socialAccountId) === String(data.accountId),
    );

    const isDisabled = isInclude || isAlreadyInProposal;
    const isActive = isSelectedNow || isAlreadyInProposal;

    const socialIcon = getSocialMediaIcon(data.socialMedia as SocialMediaType);

    return (
        <div
            ref={dropdownRef}
            onClick={() => {
                if (isDisabled) return;
                actions.setPromoCards(data);
            }}
            className={`bc_card ${flag ? "open" : ""} ${isInclude ? "include" : ""} ${
                isActive ? "active" : ""
            } ${isAlreadyInProposal ? "include" : ""}`}
        >
            <div className="bc_card__head">
                <div className="cost">
                    {data.logoUrl ? <img src={data.logoUrl} alt="" /> : null}
                    <p>
                        {getPriceByCurrency(data?.prices, selectedCurrency)}
                        {selectedCurrency.key}
                    </p>
                </div>

                <div className="social">
                    {socialIcon ? <img src={socialIcon} alt="" /> : null}
                    <p>{formatFollowers(data.followers)}</p>
                </div>
            </div>

            <div className="information">
                <div className="overflow">
                    <p>{data.username}</p>
                </div>

                <div onClick={(e) => e.stopPropagation()} className="genresIcountries">
                    {hasMeta && (
                        <div
                            onClick={() => setFlag((prev) => !prev)}
                            className={`information__head ${flag ? "active" : ""}`}
                        >
                            <img src={chevronDown} alt="" />
                        </div>
                    )}
                </div>

                {flag && hasMeta && (
                    <GenresCountries
                        ref={dropdownRef}
                        setOpen={setFlag}
                        open={flag}
                        data={{
                            engagementRate: data.engagementRate,
                            averageViews: data.averageViews,
                            musicGenres: data.musicGenres ?? [],
                            countries: data.countries ?? [],
                        }}

                        activePromo={isActive ? data : undefined}
                        isInclude={isInclude || isAlreadyInProposal}
                    />
                )}
            </div>

            {isInclude && (
                <div className="included-text">
                    <p>Included in your selected offer</p>
                </div>
            )}

            {isAlreadyInProposal && !isInclude && (
                <div className="included-text">
                    <p>Already added to this proposal</p>
                </div>
            )}
        </div>
    );
};