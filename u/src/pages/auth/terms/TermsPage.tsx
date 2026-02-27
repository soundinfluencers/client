import type { FC } from "react";
import "./_terms-page.scss";
import { ButtonMain } from "../../../components/ui/buttons/button/Button.tsx";

export const TermsPage: FC = () => {
  const handleClickButton = () => {
    window.close();
  };

  return (
    <div className="terms-page__wrapper">
      <div className="terms-page">
        <div className="terms-page__title-block">
          <p className="terms-page__title">
            User agreement between Soundinfluencers.com users
          </p>
          <p className="terms-page__subtitle">and Techno TV LTD</p>
        </div>

        <p className="terms-page__main-text">
          This Agreement is made between users of soundinfluencers.com (clients)
          and TECHNO TV LTD (marketer), a company incorporated in England and
          Wales, currently representing soundinfluencers.com.
        </p>

        <ul className="terms-page__list">
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              1. Services provided:
            </p>
            <p className="terms-page__main-text">
              1.1 The Marketer agrees to deliver marketing services on social
              media platforms, specifically Instagram. Services include a
              "REQUEST" comprising one post and one story from social media
              networks accessible on soundinfluencers.com.
            </p>
          </li>
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">2. Delivery timing:</p>
            <p className="terms-page__main-text">
              2.1 Services commence upon receipt of the agreed monetary
              remuneration in the Marketer's bank account. The Marketer reserves
              the right to adjust requested times if deemed necessary.
            </p>
          </li>
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">3. Content approval:</p>
            <p className="terms-page__main-text">
              3.1 The client's submitted content will undergo approval by
              platform coordinators before being published. Networks retain the
              right to accept or reject content requests made by clients or the
              soundinfluencers.com team.
            </p>
          </li>
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">4. Influence value:</p>
            <p className="terms-page__main-text">
              4.1 The "Total Influence" is the total count of followers of
              selected influencers at the campaign's start, and in case of a
              dispute, is valued at £0.3 (30 pence) for each 1000 followers.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              5. Disagreeing networks:
            </p>
            <p className="terms-page__main-text">
              5.1 In case of non-compliance by networks (Disagreeing Networks),
              the Marketer agrees to refund or replace the influence not
              delivered within 45 days. Unused posts and services not delivered
              and/or not requested by the client after a period of 60 days from
              the date of the campaign start do not accumulate, transfer, and/or
              can be used in any way.
            </p>
          </li>
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              6. Refund booking fees:
            </p>
            <p className="terms-page__main-text">
              6.1 The Client can withhold a 20% booking fee in case of a refund.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">7.Content</p>
            <p className="terms-page__main-text">
              7.1 The Client asserts ownership of copyrights and licenses for
              graphic and video designs. The Marketer reserves the right to
              advise and/or choose or request alternative content for posting.
            </p>{" "}
            <p className="terms-page__main-text">
              7.2 The Client agrees to provide the correct description and
              content access links. In case of a mistake from the Client, the
              Marketer reserves the right to keep the sum paid by the Client and
              not provide the service requested.
            </p>{" "}
            <p className="terms-page__main-text">
              7.3 Supplied content must be related to electronic music, techno
              music, and related genres, with good broadcast quality and no
              copyright infringement.
            </p>
          </li>
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">8. Operations:</p>
            <p className="terms-page__main-text">
              8.1 The Marketer decides whether to accept a campaign and work
              with a client. The right to terminate accounts and campaigns is
              reserved.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">9. Report:</p>
            <p className="terms-page__main-text">
              9.1 Clients can access a campaign report on soundinfluencers.com,
              including links to posts, likes, and impressions counts.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              10. Payment and fees:
            </p>
            <p className="terms-page__main-text">
              10.1 The total cost is calculated on soundinfluencers.com. Payment
              details are provided on the website, and payment is due within 5
              business days from campaign selection.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              11. Payment and fees:
            </p>
            <p className="terms-page__main-text">
              11.1 The agreement is effective upon user acceptance on
              soundinfluencers.com. It can be terminated by the Marketer or the
              client after the completion and full payment of the latest
              campaign.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">12. Confidentiality:</p>
            <p className="terms-page__main-text">
              12.1 Confidential information must be kept confidential by the
              client for 2 years.
            </p>{" "}
            <p className="terms-page__main-text">
              12.2 The Client allows the Marketer to use its name for
              promotional purposes.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              13. Relationship between parties:
            </p>
            <p className="terms-page__main-text">
              13.1 The Marketer is an independent contractor, not an employee
            </p>{" "}
            <p className="terms-page__main-text">
              13.2 The agreement is non-exclusive, allowing both parties to
              enter agreements with others.
            </p>
            <p className="terms-page__main-text">
              13.3 Resale of Marketer services by the Client to third parties is
              prohibited without written consent.
            </p>
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              14. Intellectual property:
            </p>
            <p className="terms-page__main-text">
              14.1 Copyrighted material provided by the Client remains the
              Client's property.
            </p>{" "}
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">
              15. Limition of liability:
            </p>
            <p className="terms-page__main-text">
              15.1 The Marketer is not liable for indirect damages unless caused
              by negligence or breach.
            </p>{" "}
            <p className="terms-page__main-text">
              15.2 The client is responsible for damages resulting from the
              Marketer's services.
            </p>{" "}
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">16. Amendments:</p>
            <p className="terms-page__main-text">
              16.1 Any amendments to the agreement must be in writing and agreed
              by both parties.
            </p>{" "}
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">17.Entire agreement:</p>
            <p className="terms-page__main-text">
              17.1 The agreement supersedes all prior agreements and
              understandings.
            </p>{" "}
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">18. Severability:</p>
            <p className="terms-page__main-text">
              18.1 If any provision is found void, the remaining provisions will
              still be enforced.
            </p>{" "}
          </li>{" "}
          <li className="terms-page__list-item">
            <p className="terms-page__list-item-header">19. Compliance:</p>
            <p className="terms-page__main-text">
              19.1 Clients shall adhere to the terms and conditions outlined in
              the agreement for the smooth execution of promotional campaigns.
            </p>{" "}
          </li>{" "}
        </ul>
      </div>

      <div className="terms-page__controls">
        <ButtonMain
          text={"Ok"}
          onClick={handleClickButton}
          isDisabled={false}
        />
      </div>
    </div>
  );
};
