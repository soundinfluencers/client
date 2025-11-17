import type {FC} from "react";
import './_terms-page.scss';
import {ButtonMain} from "../../../components/ui/buttons/button/Button.tsx";

export const TermsPage: FC = () => {
    const handleClickButton = () => {
        window.close();
    };

    return (
        <div className='terms-page__wrapper'>
            <div className='terms-page'>
                <div className='terms-page__title-block'>
                    <p className='terms-page__title'>User agreement between Soundinfluencers.com users</p>
                    <p className='terms-page__subtitle'>and Techno TV LTD</p>
                </div>

                <p className='terms-page__main-text'>This Agreement is made between users of soundinfluencers.com (clients)
                    and TECHNO TV LTD (marketer), a
                    company incorporated in England and Wales, currently representing soundinfluencers.com.</p>

                <ul className='terms-page__list'>
                    <li className='terms-page__list-item'>
                        <p className='terms-page__list-item-header'>1. Services provided:</p>
                        <p className='terms-page__main-text'>The Marketer agrees to deliver marketing services on social
                            media platforms, specifically
                            Instagram. Services include a "REQUEST" comprising one post and one story from social media
                            networks accessible on soundinfluencers.com.</p>
                    </li>

                    <li className='terms-page__list-item'>
                        <p className='terms-page__list-item-header'>2. Delivery timing:</p>
                        <p className='terms-page__main-text'>Services commence upon receipt of the agreed monetary
                            remuneration in the Marketer's bank account. The Marketer reserves the right to adjust requested
                            times if deemed necessary.</p>
                    </li>

                    <li className='terms-page__list-item'>
                        <p className='terms-page__list-item-header'>3. Content approval:</p>
                        <p className='terms-page__main-text'>The client's submitted content will undergo approval by
                            platform coordinators before being published. Networks retain the right to accept or reject
                            content requests made by clients or the soundinfluencers.com team.</p>
                    </li>

                    <li className='terms-page__list-item'>
                        <p className='terms-page__list-item-header'>4. Influence value:</p>
                        <p className='terms-page__main-text'>The "Total Influence" is the total count of followers of
                            selected influencers at the campaign's start, and in case of a dispute, is valued at £0.3 (30
                            pence) for each 1000 followers.</p>
                    </li>

                    <li className='terms-page__list-item'>
                        <p className='terms-page__list-item-header'>5. Disagreeing networks:</p>
                        <p className='terms-page__main-text'>In case of non-compliance by networks (Disagreeing Networks),
                            the Marketer agrees to refund or replace the influence not delivered within 45 days. Unused
                            posts and services not delivered and/or not requested by the client after a period of 60 days
                            from the date of the campaign start do not accumulate, transfer, and/or can be used in any
                            way.</p>
                    </li>
                </ul>
            </div>

            <div className='terms-page__controls'>
                <ButtonMain text={'Ok'} onClick={handleClickButton} isDisabled={false}/>
            </div>
        </div>
    )
};