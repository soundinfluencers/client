export interface MultiPromoAccountsBody {
  socialMedias: string[];
  countries?: string[];
  budget?: string;
  budgetCurrency?: string;
  additionalTopics?: string[];
  profileTypes?: string[];
  musicCategories?: string[];
  musicGenres: string[];
  musicGenresFilterMethod?: string;
}
