export const getCPM = (cpm: number) => {
  if (cpm < 3) return "0 to 3€";
  if (cpm < 5) return "3€ to 5€";
  if (cpm < 9) return "5€ to 9€";
  if (cpm < 12) return "9€ to 12€";
  if (cpm < 16) return "12€ to 16€";
  if (cpm < 20) return "16€ to 20€";
  if (cpm < 25) return "20€ to 25€";
  if (cpm < 30) return "25€ to 30€";
  if (cpm < 35) return "30€ to 35€";
  if (cpm < 40) return "35€ to 40€";
  return ">40€";
};