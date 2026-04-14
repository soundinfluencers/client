export const getResultCPM = (cpm: number) => {
  if (cpm < 3) return "Excellent";
  if (cpm < 5) return "Highly Above Average";
  if (cpm < 9) return "Above Average";
  if (cpm < 12) return "Average";
  return "Low Average";
};