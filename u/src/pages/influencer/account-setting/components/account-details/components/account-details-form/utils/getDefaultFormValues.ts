import type { IUser } from "../../../../../types/user";

export const getDefaultFormValues = (user: IUser) => {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    logosUrl: user.logosUrl || '',
    email: user.email || '',
    phone: user.phone || '',
    telegram: user.telegram || '',
  };
};