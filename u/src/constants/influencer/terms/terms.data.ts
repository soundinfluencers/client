export type TermsSection =
  | {
      id: number;
      title: string;
      paragraphs: string[];
    }
  | {
      id: number;
      title: string;
      bullets: string[];
    };

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 1,
    title: "Services provided:",
    paragraphs: [
      '1.1 Review and Feature Agreement: The collaborator commits to delivering marketing services on social media platforms, specifically Instagram. This involves conducting a comprehensive "REVIEW" of the media provided by the client and reaching an agreement on featuring the content within the collaborator network.',

      "1.2 Positive Review Commitment: In the case of a Positive Review, the collaborator agrees to feature the content with one post and one story on the social media page designated through soundinfluencers.com. The agreed reward for this service is the payment determined on soundinfluencer.com.",

      "1.3 Compliance with Content Specifications: The influencer additionally commits to using the correct captions, tags, and swipe-up links as specified on soundinfluencer.com by the client.",

      "1.4 Negative Review: In the event of a Negative Review, the collaborator acknowledges that no compensation will be received.",

      "1.5 Content Distribution and Maintenance: The collaborator agrees not to delete content distributed on their networks following requests received on soundinfluencers.com.",

      "1.6 Reporting and Timing: The collaborator undertakes to provide the number of likes, impressions, and a screenshot of such statistics through the system on soundinfluencers.com at least 24 hours after content distribution and no longer than 7 days after content distribution.",

      "1.7 Restrictions on Contact: The influencer agrees not to contact the content provider who delivered the content to soundinfluencers.com for further requests without written approval from the soundinfluencers.com team.",

      "1.8 Timely Content Delivery: The influencer commits to delivering the content to their own social media network within the best and quickest timeframe possible, not exceeding 5 days after approval through soundinfluencers.com.",

      "1.9 Removal of Content Requests: The influencer acknowledges that a content request may be removed from their account at the discretion of the soundinfluencers.com team.",

      "1.10 Payment and Invoice Details: The influencer agrees to provide payment and invoice details through the website, affirming the correctness of the information. Once the invoice is submitted, the payment will proceed to the provided details, and this option cannot be revoked.",

      "1.11 Content Rights and Edits: The soundinfluencers team requests content providers to ensure they have all rights to the requested content. The influencer agrees not to make edits or changes that could harm the campaign or violate copyright infringement rights.",
    ],
  },

  {
    id: 2,
    title: "Term:",
    paragraphs: [
      "This agreement is effective upon user acceptance on soundinfluencers.com and may be terminated after completion and full payment of the latest campaign.",
    ],
  },

  {
    id: 3,
    title: "Confidentiality:",
    bullets: [
      "Confidential information must be kept confidential by influencers for 2 years.",
      "The influencers allow soundinfluencer.com to use its name for promotional purposes.",
    ],
  },

  {
    id: 4,
    title: "Relationship between parties:",
    bullets: [
      "Soundinfluencers.com is an independent contractor, not an employee.",
      "The agreement is non-exclusive, allowing both parties to enter agreements with others.",
      "Resale of Soundinfluencers.com services by the influencers to third parties is prohibited without written consent.",
    ],
  },

  {
    id: 5,
    title: "Intellectual property:",
    bullets: [
      "Copyrighted material provided by the Soundinfluencers.com Client remains the Client's property.",
    ],
  },

  {
    id: 6,
    title: "Limitation of liability:",
    bullets: [
      "Soundinfluencers.com is not liable for indirect damages unless caused by negligence or breach.",
      "The influencers are responsible for damages resulting from the soundinfluencers.com services.",
    ],
  },

  {
    id: 7,
    title: "Amendments:",
    paragraphs: [
      "Any amendments must be made in writing and agreed upon by both parties.",
    ],
  },

  {
    id: 8,
    title: "Entire agreement:",
    paragraphs: [
      "The agreement supersedes all prior agreements and understandings.",
    ],
  },

  {
    id: 9,
    title: "Severability:",
    paragraphs: [
      "If any provision is found void, the remaining provisions will still be enforced.",
    ],
  },

  {
    id: 10,
    title: "Compliance:",
    paragraphs: [
      "Influencers shall adhere to the terms and conditions outlined in the agreement for the smooth execution of promotional campaigns.",
    ],
  },
];
