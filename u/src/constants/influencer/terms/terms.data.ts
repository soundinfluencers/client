export type TermsSection = {
  id: number;
  title: string;
  paragraphs: {
    number?: string;
    boldText?: string;
    text: string;
  }[];
};

export const TERMS_TITLE = 'User agreement between Soundinfluencers.com users';
export const TERMS_SUBTITLE = 'and Techno TV LTD';
export const TERMS_MAIN_TEXT =
  'This Agreement is entered into between collaborator users of soundinfluencers.com\n' +
  '(referred to as "collaborators") and TECHNO TV LTD (referred to as the "client"),\n' +
  'a company incorporated in England and Wales, presently representing\n' +
  'soundinfluencers.com.';

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 1,
    title: "Services provided:",
    paragraphs: [
      {
        number: "1.1",
        boldText: "Review and Feature Agreement:",
        text: "The collaborator commits to delivering marketing services on social media platforms, specifically Instagram. This involves conducting a comprehensive \"REVIEW\" of the media provided by the client and reaching an agreement on featuring the content within the collaborator network.",
      },
      {
        number: "1.2",
        boldText: "Positive Review Commitment:",
        text: "In the case of a Positive Review, the collaborator agrees to feature the content with one post and one story on the social media page designated through soundinfluencers.com. The agreed reward for this service is the payment determined on soundinfluencer.com.",
      },
      {
        number: "1.3",
        boldText: "Compliance with Content Specifications:",
        text: "The influencer additionally commits to using the correct captions, tags, and swipe-up links as specified on soundinfluencer.com by the client.",
      },
      {
        number: "1.4",
        boldText: "Negative Review:",
        text: "In the event of a Negative Review, the collaborator acknowledges that no compensation will be received.",
      },
      {
        number: "1.5",
        boldText: "Content Distribution and Maintenance:",
        text: "The collaborator agrees not to delete content distributed on their networks following requests received on soundinfluencers.com.",
      },
      {
        number: "1.6",
        boldText: "Reporting and Timing:",
        text: "The collaborator undertakes to provide the number of likes, impressions, and a screenshot of such statistics through the system on soundinfluencers.com at least 24 hours after content distribution and no longer than 7 days after content distribution.",
      },
      {
        number: "1.7",
        boldText: "Restrictions on Contact:",
        text: "The influencer agrees not to contact the content provider who delivered the content to soundinfluencers.com for further requests without written approval from the soundinfluencers.com team.",
      },
      {
        number: "1.8",
        boldText: "Timely Content Delivery:",
        text: "The influencer commits to delivering the content to their own social media network within the best and quickest timeframe possible, not exceeding 5 days after approval through soundinfluencers.com.",
      },
      {
        number: "1.9",
        boldText: "Removal of Content Requests:",
        text: "The influencer acknowledges that a content request may be removed from their account at the discretion of the soundinfluencers.com team.",
      },
      {
        number: "1.10",
        boldText: "Payment and Invoice Details:",
        text: "The influencer agrees to provide payment and invoice details through the website, affirming the correctness of the information. Once the invoice is submitted, the payment will proceed to the provided details, and this option cannot be revoked.",
      },
      {
        number: "1.11",
        boldText: "Content Rights and Edits:",
        text: "The soundinfluencers team requests content providers to ensure they have all rights to the requested content. The influencer agrees not to make edits or changes that could harm the campaign or violate copyright infringement rights.",
      },
    ],
  },

  {
    id: 2,
    title: "Term:",
    paragraphs: [
      {
        number: "2.1",
        text: "The agreement is effective upon user acceptance on soundinfluencers.com. It can be terminated by the soundinfluencers.com team or the client after the completion and full payment of the latest campaign.",
      }
    ],
  },

  {
    id: 3,
    title: "Confidentiality:",
    paragraphs: [
      {
        number: "3.1",
        text: "Confidential information must be kept confidential by influencers for 2 years.",
      },
      {
        number: "3.2",
        text: "The influencers allow soundinfluencers.com to use its name for promotional purposes.",
      }
    ],
  },

  {
    id: 4,
    title: "Relationship between parties:",
    paragraphs: [
      {
        number: "4.1",
        text: "Soundinfluencers.com is an independent contractor, not an employee.",
      },
      {
        number: "4.2",
        text: "The agreement is non-exclusive, allowing both parties to enter agreements with others.",
      },
      {
        number: "4.3",
        text: "Resale of Soundinfluencers.com services by the influencers to third parties is prohibited without written consent.",
      },
    ],
  },

  {
    id: 5,
    title: "Intellectual property:",
    paragraphs: [
      {
        number: "5.1",
        text: "Copyrighted material provided by the Soundinfluencers.com Client remains the Client's property.",
      },
    ],
  },

  {
    id: 6,
    title: "Limitation of liability:",
    paragraphs: [
      {
        number: "6.1",
        text: "Soundinfluencers.com is not liable for indirect damages unless caused by negligence or breach.",
      },
      {
        number: "6.2",
        text: "The influencers are responsible for damages resulting from the soundinfluencers.com services.",
      },
    ],
  },

  {
    id: 7,
    title: "Amendments:",
    paragraphs: [
      {
        number: "7.1",
        text: "Any amendments to the agreement must be in writing and agreed upon by both parties.",
      },
    ],
  },

  {
    id: 8,
    title: "Entire agreement:",
    paragraphs: [
      {
        number: "8.1",
        text: "The agreement supersedes all prior agreements and understandings.",
      },
    ],
  },

  {
    id: 9,
    title: "Severability:",
    paragraphs: [
      {
        number: "9.1",
        text: "If any provision is found void, the remaining provisions will still be enforced.",
      },
    ],
  },

  {
    id: 10,
    title: "Compliance:",
    paragraphs: [
      {
        number: "10.1",
        text: "Influencers shall adhere to the terms and conditions outlined in the agreement for the smooth execution of promotional campaigns.",
      },
    ],
  },
];
