import './_empty-promo-list.scss';
import emptyListIcon from "@/assets/empty-list/empty-list-img.svg";
import clockRotateIcon from "@/assets/empty-list/clock-rotate.svg";
import { Container } from "@/components";
import { ButtonMain, ButtonSecondary } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { useNavigate } from "react-router-dom";
import React from "react";

import iconCheck from "@/assets/icons/check.svg";
import {
    EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO,
    EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO_TITLE,
} from "@/pages/influencer/promos/distributing/components/empty-distributing-list/data/description.data.ts";

//TODO: impl adaptive design for mobile and tablet
interface Props {
    title?: string;
    description?: string;
    additionalDescription?: string;
    isDashboard?: boolean;
    isHistory?: boolean;
    isNew?: boolean;
}

export const EmptyPromosList: React.FC<Props> = ({ title, description, additionalDescription, isDashboard, isHistory, isNew }) => {
    const navigate = useNavigate();

    return (
        <Container className="empty-promos-list">
            <img
                className={'empty-promos-list__img'}
                src={isHistory ? clockRotateIcon : emptyListIcon}
                alt=""
                aria-hidden={true}
                loading="lazy"
            />

            <div className={'empty-promos-list__content'}>
                <div className="empty-promos-list__title-block">
                    <h1 className="empty-promos-list__title">{title}</h1>
                    <div className={'empty-promos-list__description-block'}>
                        <p className="empty-promos-list__description">{description}</p>
                        {additionalDescription && (
                            <p className="empty-promos-list__additional-description">{additionalDescription}</p>
                        )}
                    </div>
                </div>

                {!isDashboard && (
                    <ButtonMain
                        label={'Go to Dashboard'}
                        onClick={() => navigate('/')}
                    />
                )}
                {isHistory && (
                    <ButtonMain
                        label={'Explore Campaigns'}
                        onClick={() => navigate('/influencer/promos/new-promos')}
                    />
                )}
            </div>

            {isNew && (
                <>
                    <div
                        className="empty-distributing-list__additional-info"
                        style={{
                            marginTop: 32,
                            width: '100%',
                        }}
                    >
                        <p className={'empty-distributing-list__additional-info-title'}>{EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO_TITLE}</p>
                        <ul className={'empty-distributing-list__additional-info-options'}>
                            {EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO.map(info => (
                                <li key={info.id} className={'empty-distributing-list__additional-info-options__item'}>
                                    <img
                                        className={'empty-distributing-list__additional-info-icon'}
                                        src={iconCheck}
                                        alt=""
                                        aria-hidden={true}
                                    />
                                    {info.text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={'empty-distributing-list__footer'} style={{ marginTop: 32 }}>
                        <ButtonSecondary
                            label={'Manage Social Accounts'}
                            onClick={() => navigate('/influencer/social-accounts')}
                        />
                    </div>
                </>
            )}
        </Container>
    );
};