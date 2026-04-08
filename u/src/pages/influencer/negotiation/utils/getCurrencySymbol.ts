export const getCurrencySymbol = (currency: string | null) => {
  switch (currency) {
    case 'USD':
      return '\u0024';
    case 'EUR':
      return '\u20AC';
    case 'GBP':
      return '\u00A3';
    default:
      return '';
  }
};
